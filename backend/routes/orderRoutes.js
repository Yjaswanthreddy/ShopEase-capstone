const express = require('express');
const { body } = require('express-validator');
const {
  checkoutValidators,
  listMine,
  getOne,
  placeOrder,
  cancelOrder,
  requestReturn,
  adminList,
  adminUpdateStatus,
  paramId,
} = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const r = express.Router();
r.use(requireAuth);
r.get('/', listMine);
r.get('/admin/all', requireAdmin, adminList);
r.get('/:id', paramId, validateRequest, getOne);
r.post('/checkout', checkoutValidators, validateRequest, placeOrder);
r.post('/:id/cancel', paramId, validateRequest, cancelOrder);
r.post('/:id/return', paramId, validateRequest, requestReturn);
r.patch(
  '/:id/status',
  requireAdmin,
  paramId,
  validateRequest,
  body('status').notEmpty(),
  validateRequest,
  adminUpdateStatus
);
module.exports = r;
