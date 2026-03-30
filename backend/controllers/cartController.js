const { body, param, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { getOrCreateCartId } = require('../models/cartModel');

const addValidators = [
  body('product_id').isInt(),
  body('quantity').isInt({ min: 1 }),
];

const updateValidators = [body('quantity').isInt({ min: 1 })];

async function fetchCart(userId) {
  const cartId = await getOrCreateCartId(userId);
  const [items] = await pool.query(
    `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.brand, p.price, p.stock_quantity
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );
  let subtotal = 0;
  const lines = items.map((row) => {
    const line = Number(row.price) * row.quantity;
    subtotal += line;
    return { ...row, line_total: line };
  });
  return { cartId, items: lines, subtotal, itemCount: lines.reduce((s, i) => s + i.quantity, 0) };
}

const getCart = asyncHandler(async (req, res) => {
  const data = await fetchCart(req.user.id);
  res.json({ success: true, ...data });
});

const addItem = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { product_id, quantity } = req.body;
  const [[p]] = await pool.query('SELECT id, price, stock_quantity FROM products WHERE id=?', [
    product_id,
  ]);
  if (!p) return res.status(404).json({ success: false, error: 'Product not found' });
  const cartId = await getOrCreateCartId(req.user.id);
  const [[line]] = await pool.query(
    'SELECT id, quantity FROM cart_items WHERE cart_id=? AND product_id=?',
    [cartId, product_id]
  );
  const newQty = (line ? line.quantity : 0) + quantity;
  if (newQty > p.stock_quantity) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient stock',
      available: p.stock_quantity,
    });
  }
  if (line) {
    await pool.query('UPDATE cart_items SET quantity=? WHERE id=?', [newQty, line.id]);
  } else {
    await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?,?,?)', [
      cartId,
      product_id,
      quantity,
    ]);
  }
  res.status(201).json({ success: true });
});

const updateItem = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { quantity } = req.body;
  const cartId = await getOrCreateCartId(req.user.id);
  const [[row]] = await pool.query(
    `SELECT ci.id, ci.product_id FROM cart_items ci WHERE ci.id=? AND ci.cart_id=?`,
    [req.params.id, cartId]
  );
  if (!row) return res.status(404).json({ success: false, error: 'Line not found' });
  const [[p]] = await pool.query('SELECT stock_quantity FROM products WHERE id=?', [row.product_id]);
  if (quantity > p.stock_quantity) {
    return res.status(400).json({ success: false, error: 'Insufficient stock', available: p.stock_quantity });
  }
  await pool.query('UPDATE cart_items SET quantity=? WHERE id=?', [quantity, row.id]);
  res.json({ success: true });
});

const removeItem = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCartId(req.user.id);
  const [r] = await pool.query('DELETE FROM cart_items WHERE id=? AND cart_id=?', [
    req.params.id,
    cartId,
  ]);
  if (!r.affectedRows) return res.status(404).json({ success: false, error: 'Line not found' });
  res.json({ success: true });
});

const clearCart = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCartId(req.user.id);
  await pool.query('DELETE FROM cart_items WHERE cart_id=?', [cartId]);
  res.json({ success: true });
});

module.exports = {
  addValidators,
  updateValidators,
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  paramLineId: [param('id').isInt()],
};
