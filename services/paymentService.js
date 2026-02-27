const Razorpay = require('razorpay');
const { Order, Customer, Subscription } = require('../models');
const { sequelize } = require('../models');
const logger = require('../utils/logger');
const constants = require('../config/constants');

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const err = new Error('Payment gateway not configured');
    err.status = 503;
    err.code = 'PAYMENT_GATEWAY_UNAVAILABLE';
    throw err;
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

exports.createGatewayOrder = async (customerId, orderId, amount) => {
  try {
    const razorpay = getRazorpayClient();
    const amountPaise = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      const err = new Error('Invalid order amount');
      err.status = 400;
      err.code = 'INVALID_AMOUNT';
      throw err;
    }
    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: { customerId: String(customerId), orderId: String(orderId) },
    };
    const razorpayOrder = await razorpay.orders.create(options);
    await Order.update(
      { gateway_order_id: razorpayOrder.id, gateway_provider: 'RAZORPAY' },
      { where: { order_id: orderId } }
    );
    return razorpayOrder;
  } catch (error) {
    if (error.status === 503 || error.status === 400) throw error;
    logger.error('Razorpay order creation failed', error);
    const err = new Error('Payment gateway error. Please try again later.');
    err.status = 502;
    err.code = 'PAYMENT_GATEWAY_ERROR';
    throw err;
  }
};

exports.handlePaymentWebhook = async (event, paymentData) => {
  const transaction = await sequelize.transaction();
  try {
    // paymentData contains: order_id, payment_id, status (captured/failed)
    const { order_id, payment_id, status } = paymentData;

    const order = await Order.findOne({
      where: { gateway_order_id: order_id },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
    if (!order) {
      const err = new Error('Order not found. Use an order_id (gateway_order_id) from create-order.');
      err.status = 404;
      throw err;
    }
    if (order.payment_status === 'SUCCESS') {
      await transaction.commit();
      return { processed: false, message: 'Already processed' };
    }

    // In dev/testing the same payment_id (e.g. pay_test123) may be reused for multiple orders;
    // DB has unique (gateway_provider, gateway_payment_id), so make it unique per order when testing.
    const isDevBypass = process.env.ALLOW_WEBHOOK_DEV_BYPASS === '1' || process.env.ALLOW_WEBHOOK_DEV_BYPASS === 'true';
    const gatewayPaymentId =
      isDevBypass && (payment_id.startsWith('pay_test') || payment_id === 'pay_test123')
        ? `${payment_id}_${order.order_id}`
        : payment_id;

    await order.update({
      payment_status: status === 'captured' ? 'SUCCESS' : 'FAILED',
      gateway_payment_id: gatewayPaymentId,
    }, { transaction });

    if (status === 'captured') {
      await Customer.update(
        { status: 'PAID' },
        { where: { customer_id: order.customer_id }, transaction }
      );

      if (order.order_type === 'STARTER_SETUP') {
        await Subscription.create({
          customer_id: order.customer_id,
          plan_code: 'STARTER_MONTHLY',
          status: 'ACTIVE',
          start_date: new Date(),
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }, { transaction });
      }
    }

    await transaction.commit();
    return { processed: true };
  } catch (error) {
    await transaction.rollback();
    logger.error('Webhook processing failed', error);
    throw error;
  }
};
