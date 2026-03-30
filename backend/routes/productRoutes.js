const express = require('express');
const {
  listProducts,
  getProduct,
  categories,
  brands,
  productWriteValidators,
  createProduct,
  updateProduct,
  deleteProduct,
  paramId,
} = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const r = express.Router();
r.get('/', listProducts);
r.get('/meta/categories', categories);
r.get('/meta/brands', brands);
r.get('/:id', paramId, validateRequest, getProduct);
r.post('/', requireAuth, requireAdmin, productWriteValidators, validateRequest, createProduct);
r.put(
  '/:id',
  requireAuth,
  requireAdmin,
  paramId,
  validateRequest,
  productWriteValidators,
  validateRequest,
  updateProduct
);
r.delete('/:id', requireAuth, requireAdmin, paramId, validateRequest, deleteProduct);
module.exports = r;
