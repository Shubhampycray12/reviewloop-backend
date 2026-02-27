const paymentService = require('../../services/paymentService');
const { Order } = require('../../models');
const { validationResult } = require('express-validator');

/** Dev only: list orders that have gateway_order_id (for webhook testing). */
exports.listOrdersForWebhookTest = async (req, res, next) => {
  try {
    if (process.env.ALLOW_WEBHOOK_DEV_BYPASS !== '1' && process.env.ALLOW_WEBHOOK_DEV_BYPASS !== 'true') {
      return res.status(404).json({ success: false, error: 'Not available' });
    }
    const orders = await Order.findAll({
      where: { gateway_provider: 'RAZORPAY' },
      attributes: ['order_id', 'customer_id', 'gateway_order_id', 'payment_status', 'order_type'],
      order: [['order_id', 'DESC']],
      limit: 20,
    });
    const list = orders.map(o => ({
      order_id: o.order_id,
      customer_id: o.customer_id,
      gateway_order_id: o.gateway_order_id,
      payment_status: o.payment_status,
      order_type: o.order_type,
    }));
    res.json({
      success: true,
      data: {
        orders: list,
        hint: list.length === 0
          ? 'No orders yet. 1) POST /api/v1/public/customers/initiate (get customer_id, order_id). 2) POST /api/v1/public/payments/create-order with those ids to get gateway_order_id.'
          : 'Use any gateway_order_id in webhook payload as payload.payment.entity.order_id',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { customer_id, order_id } = req.body;
    const order = await Order.findOne({ where: { order_id, customer_id, payment_status: 'INITIATED' } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found or already processed' });
    }
    const gatewayOrder = await paymentService.createGatewayOrder(customer_id, order_id, order.amount);
    res.json({
      success: true,
      data: {
        gateway_provider: 'RAZORPAY',
        gateway_order_id: gatewayOrder.id,
        amount_inr: order.amount,
        currency: order.currency,
        customer_id,
        order_id,
        checkout: {
          key: process.env.RAZORPAY_KEY_ID,
          name: 'ReviewLoop.in',
          description: 'ReviewLoop - ' + order.order_type,
          prefill: { email: req.body.email, contact: req.body.contact }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
