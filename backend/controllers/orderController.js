const { body, param, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { getOrCreateCartId } = require('../models/cartModel');

const checkoutValidators = [
  body('shipping_name').trim().notEmpty(),
  body('shipping_line1').trim().notEmpty(),
  body('shipping_line2').optional(),
  body('shipping_city').trim().notEmpty(),
  body('shipping_postal').trim().notEmpty(),
  body('shipping_country').optional().trim(),
];

const listMine = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, status, total_amount, created_at, shipping_city
     FROM orders WHERE user_id=? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, orders: rows });
});

const getOne = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query('SELECT * FROM orders WHERE id=?', [id]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
  const o = rows[0];
  if (req.user.role !== 'admin' && o.user_id !== req.user.id) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  const [items] = await pool.query(
    `SELECT oi.*, p.name, p.brand FROM order_items oi
     JOIN products p ON p.id=oi.product_id WHERE oi.order_id=?`,
    [id]
  );
  const [[pay]] = await pool.query('SELECT * FROM payments WHERE order_id=?', [id]);
  res.json({ success: true, order: o, items, payment: pay || null });
});

const placeOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const userId = req.user.id;
  const cartId = await getOrCreateCartId(userId);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [lines] = await conn.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.price, p.stock_quantity, p.name
       FROM cart_items ci
       JOIN products p ON p.id=ci.product_id
       WHERE ci.cart_id=? FOR UPDATE`,
      [cartId]
    );
    if (!lines.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }
    let total = 0;
    for (const l of lines) {
      if (l.quantity > l.stock_quantity) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${l.name}`,
          product_id: l.product_id,
          available: l.stock_quantity,
        });
      }
      total += Number(l.price) * l.quantity;
    }
    const {
      shipping_name,
      shipping_line1,
      shipping_line2,
      shipping_city,
      shipping_postal,
      shipping_country = 'IN',
    } = req.body;
    const [ins] = await conn.query(
      `INSERT INTO orders (user_id, status, total_amount, shipping_name, shipping_line1, shipping_line2,
        shipping_city, shipping_postal, shipping_country)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        userId,
        'pending_payment',
        total,
        shipping_name,
        shipping_line1,
        shipping_line2 || null,
        shipping_city,
        shipping_postal,
        shipping_country,
      ]
    );
    const orderId = ins.insertId;
    for (const l of lines) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)`,
        [orderId, l.product_id, l.quantity, l.price]
      );
      await conn.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id=?', [
        l.quantity,
        l.product_id,
      ]);
    }
    await conn.query('DELETE FROM cart_items WHERE cart_id=?', [cartId]);
    await conn.commit();
    res.status(201).json({ success: true, order_id: orderId, total_amount: total });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

async function restoreStockForOrder(conn, orderId) {
  const [lines] = await conn.query(
    'SELECT product_id, quantity FROM order_items WHERE order_id=?',
    [orderId]
  );
  for (const l of lines) {
    await conn.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id=?', [
      l.quantity,
      l.product_id,
    ]);
  }
}

const cancelOrder = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[o]] = await conn.query('SELECT * FROM orders WHERE id=? FOR UPDATE', [id]);
    if (!o) {
      await conn.rollback();
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    if (o.user_id !== req.user.id && req.user.role !== 'admin') {
      await conn.rollback();
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const cancellable = ['pending_payment', 'paid', 'processing'];
    if (!cancellable.includes(o.status)) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: 'Order cannot be cancelled in current state' });
    }
    await restoreStockForOrder(conn, id);
    await conn.query(`UPDATE orders SET status='cancelled' WHERE id=?`, [id]);
    await conn.query(
      `UPDATE payments SET status='refunded' WHERE order_id=? AND status='completed'`,
      [id]
    );
    await conn.query(`UPDATE payments SET status='failed' WHERE order_id=? AND status='pending'`, [id]);
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

const requestReturn = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [[o]] = await pool.query('SELECT * FROM orders WHERE id=?', [id]);
  if (!o) return res.status(404).json({ success: false, error: 'Not found' });
  if (o.user_id !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });
  if (!['delivered', 'shipped'].includes(o.status)) {
    return res.status(400).json({ success: false, error: 'Return not allowed for this order' });
  }
  await pool.query(`UPDATE orders SET status='return_requested' WHERE id=?`, [id]);
  res.json({ success: true });
});

const adminList = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT o.*, u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`
  );
  res.json({ success: true, orders: rows });
});

const adminUpdateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = [
    'pending_payment',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'return_requested',
    'returned',
    'refunded',
  ];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  const [r] = await pool.query('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true });
});

module.exports = {
  checkoutValidators,
  listMine,
  getOne,
  placeOrder,
  cancelOrder,
  requestReturn,
  adminList,
  adminUpdateStatus,
  paramId: [param('id').isInt()],
};
