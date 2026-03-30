/**
 * Client-side mirror of backend/services/paymentValidationService.js (subset for UX).
 */
(function () {
  const UPI_SUFFIXES = ['ybl', 'upi', 'oksbi', 'okhdfc'];
  const UPI_REGEX = new RegExp(`^[a-zA-Z0-9._-]{2,256}@(${UPI_SUFFIXES.join('|')})$`, 'i');

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

  function validateCard(payload) {
    const pan = String(payload.pan || '').replace(/\D/g, '');
    const holder = String(payload.holder || '').trim();
    if (holder.length < 2) return { ok: false, message: 'Invalid cardholder name' };
    if (pan.length < 13 || pan.length > 19) return { ok: false, message: 'Invalid card number' };
    if (!luhnValid(pan)) return { ok: false, message: 'Invalid card number (checksum)' };
    if (!/^\d{2}\/\d{2}$/.test(String(payload.expiry || '').trim())) {
      return { ok: false, message: 'Expiry must be MM/YY' };
    }
    const cvv = String(payload.cvv || '').replace(/\D/g, '');
    if (cvv.length < 3 || cvv.length > 4) return { ok: false, message: 'Invalid CVV' };
    if (pan === '4000000000000002') return { ok: false, message: 'Insufficient funds (simulated)' };
    return { ok: true };
  }

  function validateUPI(id) {
    const v = String(id || '').trim();
    if (!UPI_REGEX.test(v)) {
      return { ok: false, message: 'UPI must use @' + UPI_SUFFIXES.join(', @') };
    }
    if (/^invalid\./i.test(v)) return { ok: false, message: 'Invalid UPI (simulated)' };
    if (/^nofunds\./i.test(v)) return { ok: false, message: 'Insufficient balance (simulated)' };
    return { ok: true };
  }

  window.ShopEasePayment = { validateCard, validateUPI, UPI_SUFFIXES };
})();
