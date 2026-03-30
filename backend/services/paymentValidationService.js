/**
 * Client-side style validation mirrored server-side for production-grade checks.
 * Simulated outcomes use reserved PAN / UPI patterns for QA automation.
 */

const UPI_SUFFIXES = ['ybl', 'upi', 'oksbi', 'okhdfc'];
const UPI_REGEX = new RegExp(`^[a-zA-Z0-9._-]{2,256}@(${UPI_SUFFIXES.join('|')})$`, 'i');

/** Luhn check for card numbers (digits only) */
function luhnValid(digits) {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function normalizeCardPan(pan) {
  return String(pan || '').replace(/\D/g, '');
}

function parseExpiry(expiry) {
  const m = String(expiry || '').trim().match(/^(\d{2})\/(\d{2})$/);
  if (!m) return null;
  const mm = parseInt(m[1], 10);
  const yy = parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return null;
  return { month: mm, year: 2000 + yy };
}

function expiryNotPast(expiry) {
  const p = parseExpiry(expiry);
  if (!p) return false;
  const now = new Date();
  const last = new Date(p.year, p.month, 0, 23, 59, 59);
  return last >= now;
}

function validateCvv(cvv, cardType) {
  const d = String(cvv || '').replace(/\D/g, '');
  if (cardType === 'amex') return d.length === 4;
  return d.length === 3;
}

/**
 * @param {{ pan: string, expiry: string, cvv: string, holder: string, type: 'credit'|'debit' }} input
 */
function validateCard(input) {
  const type = input.type === 'debit' ? 'debit' : 'credit';
  const pan = normalizeCardPan(input.pan);
  const holder = String(input.holder || '').trim();
  if (holder.length < 2) {
    return { ok: false, code: 'INVALID_HOLDER', message: 'Invalid cardholder name' };
  }
  if (pan.length < 13 || pan.length > 19) {
    return { ok: false, code: 'INVALID_PAN_LENGTH', message: 'Invalid card number length' };
  }
  if (!luhnValid(pan)) {
    return { ok: false, code: 'INVALID_CARD', message: 'Invalid card number (Luhn failed)' };
  }
  if (!parseExpiry(input.expiry)) {
    return { ok: false, code: 'INVALID_EXPIRY', message: 'Expiry must be MM/YY' };
  }
  if (!expiryNotPast(input.expiry)) {
    return { ok: false, code: 'EXPIRED', message: 'Card expired' };
  }
  const amex = pan.startsWith('34') || pan.startsWith('37');
  if (!validateCvv(input.cvv, amex ? 'amex' : 'other')) {
    return { ok: false, code: 'INVALID_CVV', message: 'Invalid CVV' };
  }
  // Reserved test PANs (simulation)
  if (pan === '4000000000000002') {
    return { ok: false, code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds (simulated)' };
  }
  if (pan === '4000000000000069') {
    return { ok: false, code: 'DECLINED', message: 'Issuer declined (simulated)' };
  }
  return { ok: true, code: 'OK', type };
}

function validateUPI(upi) {
  const id = String(upi || '').trim().toLowerCase();
  if (!UPI_REGEX.test(id)) {
    return {
      ok: false,
      code: 'INVALID_UPI',
      message: `UPI must end with @${UPI_SUFFIXES.join(', @')}`,
    };
  }
  if (id.startsWith('invalid.')) {
    return { ok: false, code: 'INVALID_UPI', message: 'Invalid UPI (simulated)' };
  }
  if (id.startsWith('nofunds.')) {
    return { ok: false, code: 'INSUFFICIENT_FUNDS', message: 'Insufficient balance (simulated)' };
  }
  return { ok: true, code: 'OK' };
}

/**
 * @param {'card'|'upi'} method
 * @param payload
 */
function validatePayment(method, payload) {
  if (method === 'upi') {
    return validateUPI(payload.upi_id);
  }
  return validateCard({
    pan: payload.pan,
    expiry: payload.expiry,
    cvv: payload.cvv,
    holder: payload.holder,
    type: payload.card_type || 'credit',
  });
}

module.exports = {
  validateCard,
  validateUPI,
  validatePayment,
  luhnValid,
  UPI_SUFFIXES,
};
