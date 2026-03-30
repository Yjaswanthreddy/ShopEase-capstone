const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { validatePayment } = require('../services/paymentValidationService');

const processValidators = [
  body('order_id').isInt(),
  body('method').isIn(['credit_card', 'debit_card', 'upi']),
  body('pan').optional(),
  body('expiry').optional(),
  body('cvv').optional(),
  body('holder').optional(),
  body('upi_id').optional(),
];

const processPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { order_id, method } = req.body;
  const userId = req.user.id;

  const [[order]] = await pool.query('SELECT * FROM orders WHERE id=?', [order_id]);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  if (order.user_id !== userId) return res.status(403).json({ success: false, error: 'Forbidden' });
  if (order.status !== 'pending_payment') {
    return res.status(400).json({ success: false, error: 'Order is not awaiting payment' });
  }

  const [[existing]] = await pool.query(
    "SELECT id FROM payments WHERE order_id=? AND status='completed'",
    [order_id]
  );
  if (existing) {
    return res.status(409).json({ success: false, error: 'Payment already completed' });
  }

  let check;
  if (method === 'upi') {
    check = validatePayment('upi', { upi_id: req.body.upi_id });
  } else {
    check = validatePayment('card', {
      pan: req.body.pan,
      expiry: req.body.expiry,
      cvv: req.body.cvv,
      holder: req.body.holder,
      card_type: method === 'debit_card' ? 'debit' : 'credit',
    });
  }
  if (!check.ok) {
    return res.status(400).json({ success: false, error: check.message, code: check.code });
  }

  const txn = `TXN_${order_id}_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO payments (order_id, method, amount, status, transaction_ref, meta)
       VALUES (?,?,?,?,?,?)`,
      [
        order_id,
        method,
        order.total_amount,
        'completed',
        txn,
        JSON.stringify({ validated: true }),
      ]
    );
    await conn.query(`UPDATE orders SET status='paid' WHERE id=?`, [order_id]);
    await conn.commit();
    res.status(201).json({
      success: true,
      transaction_ref: txn,
      amount: order.total_amount,
    });
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: 'Duplicate payment prevented' });
    }
    throw e;
  } finally {
    conn.release();
  }
});

const refundPayment = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[o]] = await conn.query('SELECT * FROM orders WHERE id=? FOR UPDATE', [orderId]);
    if (!o) {
      await conn.rollback();
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const isAdmin = req.user.role === 'admin';
    const isOwner = o.user_id === req.user.id;
    if (!isAdmin && !isOwner) {
      await conn.rollback();
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    if (!isAdmin) {
      if (!['return_requested', 'returned'].includes(o.status)) {
        await conn.rollback();
        return res.status(400).json({ success: false, error: 'Refund not allowed for this order state' });
      }
    }
    const [[pay]] = await conn.query(
      "SELECT * FROM payments WHERE order_id=? AND status='completed'",
      [orderId]
    );
    if (!pay) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: 'No completed payment to refund' });
    }
    await conn.query(`UPDATE payments SET status='refunded' WHERE id=?`, [pay.id]);
    await conn.query(`UPDATE orders SET status='refunded' WHERE id=?`, [orderId]);
    await conn.commit();
    res.json({ success: true, message: 'Refund simulated' });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

module.exports = { processValidators, processPayment, refundPayment };
