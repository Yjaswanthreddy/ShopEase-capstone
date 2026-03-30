const express = require('express');
const { param } = require('express-validator');
const { processValidators, processPayment, refundPayment } = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const r = express.Router();
r.use(requireAuth);
r.post('/process', processValidators, validateRequest, processPayment);
r.post('/refund/:orderId', param('orderId').isInt(), validateRequest, refundPayment);
module.exports = r;
