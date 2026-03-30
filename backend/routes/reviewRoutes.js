const express = require('express');
const {
  writeValidators,
  updateValidators,
  listForProduct,
  create,
  update,
  remove,
  paramReviewId,
  paramProductId,
} = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const r = express.Router();
r.get('/product/:productId', paramProductId, validateRequest, listForProduct);
r.post('/', requireAuth, writeValidators, validateRequest, create);
r.put('/:id', requireAuth, paramReviewId, validateRequest, updateValidators, validateRequest, update);
r.delete('/:id', requireAuth, paramReviewId, validateRequest, remove);
module.exports = r;
