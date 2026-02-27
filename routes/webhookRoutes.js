const express = require('express');
const router = express.Router();
const paymentWebhookController = require('../controllers/webhooks/paymentWebhookController');

// Raw body parser applied in server.js
router.post('/payments/razorpay', paymentWebhookController.razorpayWebhook);

module.exports = router;
