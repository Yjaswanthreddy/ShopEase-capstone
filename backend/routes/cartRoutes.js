const express = require('express');
const {
  addValidators,
  updateValidators,
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  paramLineId,
} = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const r = express.Router();
r.use(requireAuth);
r.get('/', getCart);
r.post('/items', addValidators, validateRequest, addItem);
r.patch('/items/:id', paramLineId, validateRequest, updateValidators, validateRequest, updateItem);
r.delete('/items/:id', paramLineId, validateRequest, removeItem);
r.delete('/items', clearCart);
module.exports = r;
