const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { signToken } = require('../utils/jwt');
const { asyncHandler } = require('../utils/asyncHandler');

const registerValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Min 8 characters'),
  body('name').trim().notEmpty(),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const forgotValidators = [body('email').isEmail().normalizeEmail()];

const resetValidators = [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
];

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { email, password, name } = req.body;
  const [dup] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (dup.length) return res.status(409).json({ success: false, error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const [ins] = await pool.query(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?,?,?,?)',
    [email, hash, name, 'customer']
  );
  const token = signToken({ id: ins.insertId, email, role: 'customer' });
  res.status(201).json({
    success: true,
    token,
    user: { id: ins.insertId, email, name, role: 'customer' },
  });
});

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { email, password } = req.body;
  const [rows] = await pool.query(
    'SELECT id, email, password_hash, name, role FROM users WHERE email=?',
    [email]
  );
  if (!rows.length) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
  const u = rows[0];
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ success: false, error: 'Invalid email or password' });
  const token = signToken({ id: u.id, email: u.email, role: u.role });
  res.json({
    success: true,
    token,
    user: { id: u.id, email: u.email, name: u.name, role: u.role },
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { email } = req.body;
  const [rows] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
  const token = uuidv4().replace(/-/g, '');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  if (rows.length) {
    await pool.query('UPDATE users SET reset_token=?, reset_expires=? WHERE email=?', [
      token,
      expires,
      email,
    ]);
  }
  const payload = {
    success: true,
    message: 'If the email exists, reset instructions have been recorded.',
  };
  if (process.env.NODE_ENV !== 'production' && rows.length) {
    payload.dev_reset_token = token;
    payload.dev_reset_expires = expires.toISOString();
  }
  res.json(payload);
});

const resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { token, password } = req.body;
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE reset_token=? AND reset_expires > NOW()',
    [token]
  );
  if (!rows.length) {
    return res.status(400).json({ success: false, error: 'Invalid or expired token' });
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query('UPDATE users SET password_hash=?, reset_token=NULL, reset_expires=NULL WHERE id=?', [
    hash,
    rows[0].id,
  ]);
  res.json({ success: true, message: 'Password updated' });
});

const me = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, email, name, role, created_at FROM users WHERE id=?',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, user: rows[0] });
});

module.exports = {
  registerValidators,
  loginValidators,
  forgotValidators,
  resetValidators,
  register,
  login,
  forgotPassword,
  resetPassword,
  me,
};
