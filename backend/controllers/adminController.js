const { body, param, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const roleValidators = [body('role').isIn(['customer', 'admin'])];

const dashboard = asyncHandler(async (req, res) => {
  const [[u]] = await pool.query('SELECT COUNT(*) AS c FROM users');
  const [[p]] = await pool.query('SELECT COUNT(*) AS c FROM products');
  const [[o]] = await pool.query('SELECT COUNT(*) AS c FROM orders');
  const [[rev]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS s FROM payments WHERE status='completed'"
  );
  const [[ref]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS s FROM payments WHERE status='refunded'"
  );
  res.json({
    success: true,
    revenue: {
      gross: Number(rev.s),
      refunded: Number(ref.s),
      net: Number(rev.s) - Number(ref.s),
    },
    counts: { users: u.c, products: p.c, orders: o.c },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, email, name, role, created_at FROM users ORDER BY id DESC'
  );
  res.json({ success: true, users: rows });
});

const patchUserRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const id = req.params.id;
  if (Number(id) === req.user.id) {
    return res.status(400).json({ success: false, error: 'Cannot demote self' });
  }
  const [r] = await pool.query('UPDATE users SET role=? WHERE id=?', [req.body.role, id]);
  if (!r.affectedRows) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true });
});

module.exports = {
  dashboard,
  listUsers,
  patchUserRole,
  roleValidators,
  paramUserId: [param('id').isInt()],
};
