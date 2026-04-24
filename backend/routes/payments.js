const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// @route   POST /api/payments/order
router.post('/order', auth, paymentController.createOrder);

// @route   POST /api/payments/verify
router.post('/verify', auth, paymentController.verifyPayment);

// @route   POST /api/payments
router.post('/', auth, paymentController.processPayment);

module.exports = router;
