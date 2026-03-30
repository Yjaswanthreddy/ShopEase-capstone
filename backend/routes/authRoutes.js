const express = require('express');
const {
  registerValidators,
  loginValidators,
  forgotValidators,
  resetValidators,
  register,
  login,
  forgotPassword,
  resetPassword,
  me,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const r = express.Router();
r.post('/register', registerValidators, validateRequest, register);
r.post('/login', loginValidators, validateRequest, login);
r.post('/forgot-password', forgotValidators, validateRequest, forgotPassword);
r.post('/reset-password', resetValidators, validateRequest, resetPassword);
r.get('/me', requireAuth, me);
module.exports = r;
