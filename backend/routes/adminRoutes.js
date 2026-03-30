const express = require('express');
const {
  dashboard,
  listUsers,
  patchUserRole,
  roleValidators,
  paramUserId,
} = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const r = express.Router();
r.use(requireAuth, requireAdmin);
r.get('/dashboard', dashboard);
r.get('/users', listUsers);
r.patch('/users/:id/role', paramUserId, validateRequest, roleValidators, validateRequest, patchUserRole);
module.exports = r;
