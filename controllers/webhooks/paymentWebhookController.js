const crypto = require('crypto');
const paymentService = require('../../services/paymentService');
const logger = require('../../utils/logger');

const DEV_BYPASS = process.env.ALLOW_WEBHOOK_DEV_BYPASS === '1' || process.env.ALLOW_WEBHOOK_DEV_BYPASS === 'true';

exports.razorpayWebhook = async (req, res) => {
  try {
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
    const body = typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawBody.toString('utf8'));

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      if (DEV_BYPASS) {
        logger.warn('Webhook: dev bypass (no signature) – set ALLOW_WEBHOOK_DEV_BYPASS=0 in production');
      } else {
        return res.status(400).json({ success: false, error: 'Missing x-razorpay-signature' });
      }
    } else {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(503).json({ success: false, error: 'Webhook not configured' });
      }
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(rawBody);
      const digest = shasum.digest('hex');
      if (signature !== digest) {
        logger.warn('Invalid Razorpay signature');
        return res.status(400).json({ success: false, error: 'Invalid signature' });
      }
    }
    const event = body.event;
    const payment = body.payload?.payment?.entity;

    if (!payment || !payment.order_id || !payment.id) {
      logger.warn('Webhook payload missing payment entity or order_id/id');
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    // Map to our internal format (order_id = Razorpay order id = our gateway_order_id)
    const paymentData = {
      order_id: payment.order_id,
      payment_id: payment.id,
      status: payment.status === 'captured' ? 'captured' : 'failed',
    };

    const result = await paymentService.handlePaymentWebhook(event, paymentData);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Webhook error', error);
    const status = error.status || 500;
    const message = error.message || 'Internal error';
    res.status(status).json({ success: false, error: message });
  }
};
