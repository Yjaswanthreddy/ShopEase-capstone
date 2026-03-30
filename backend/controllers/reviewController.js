const { body, param, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const writeValidators = [
  body('product_id').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').optional().trim(),
  body('body').optional().trim(),
];

const updateValidators = [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().trim(),
  body('body').optional().trim(),
];

async function refreshProductRating(productId) {
  const [[agg]] = await pool.query(
    'SELECT AVG(rating) AS a, COUNT(*) AS c FROM reviews WHERE product_id=?',
    [productId]
  );
  const avg = agg.c ? Number(agg.a).toFixed(2) : '0.00';
  await pool.query('UPDATE products SET rating_avg=? WHERE id=?', [avg, productId]);
}

const listForProduct = asyncHandler(async (req, res) => {
  const pid = req.params.productId;
  const [rows] = await pool.query(
    `SELECT r.id, r.user_id, r.rating, r.title, r.body, r.created_at, r.updated_at, u.name AS author
     FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.product_id=? ORDER BY r.created_at DESC`,
    [pid]
  );
  res.json({ success: true, reviews: rows });
});

const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { product_id, rating, title, body } = req.body;
  const [[p]] = await pool.query('SELECT id FROM products WHERE id=?', [product_id]);
  if (!p) return res.status(404).json({ success: false, error: 'Product not found' });
  try {
    await pool.query(
      'INSERT INTO reviews (user_id, product_id, rating, title, body) VALUES (?,?,?,?,?)',
      [req.user.id, product_id, rating, title || null, body || null]
    );
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: 'You already reviewed this product' });
    }
    throw e;
  }
  await refreshProductRating(product_id);
  res.status(201).json({ success: true });
});

const update = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const id = req.params.id;
  const [rows] = await pool.query('SELECT * FROM reviews WHERE id=?', [id]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
  const r = rows[0];
  if (r.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  const { rating, title, body } = req.body;
  await pool.query(
    `UPDATE reviews SET
      rating = COALESCE(?, rating),
      title = COALESCE(?, title),
      body = COALESCE(?, body)
     WHERE id=?`,
    [rating ?? null, title ?? null, body ?? null, id]
  );
  await refreshProductRating(r.product_id);
  res.json({ success: true });
});

const remove = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query('SELECT * FROM reviews WHERE id=?', [id]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
  const r = rows[0];
  if (r.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  await pool.query('DELETE FROM reviews WHERE id=?', [id]);
  await refreshProductRating(r.product_id);
  res.json({ success: true });
});

module.exports = {
  writeValidators,
  updateValidators,
  listForProduct,
  create,
  update,
  remove,
  paramReviewId: [param('id').isInt()],
  paramProductId: [param('productId').isInt()],
};
