const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const planController = require('../controllers/public/planController');
const customerController = require('../controllers/public/customerController');
const paymentController = require('../controllers/public/paymentController');
const onboardingController = require('../controllers/public/onboardingController');
const oauthController = require('../controllers/public/oauthController');

router.get('/plans', planController.getPlans);

router.post('/customers/check-lead',
  body('whatsapp_phone').isMobilePhone(),
  customerController.checkLead
);

router.post('/customers/initiate',
  body('business_name').notEmpty(),
  body('owner_name').notEmpty(),
  body('whatsapp_phone').isMobilePhone(),
  body('email').optional().isEmail(),
  body('plan_code').isIn(['PHYSICAL_KIT', 'STARTER_MONTHLY']),
  customerController.initiateCustomer
);

router.get('/payments/test-orders', paymentController.listOrdersForWebhookTest);

router.post('/payments/create-order',
  body('customer_id').isInt(),
  body('order_id').isInt(),
  paymentController.createOrder
);

router.post('/customers/onboarding-details',
  body('customer_id').isInt(),
  onboardingController.submitDetails
);

router.get('/profile/connect', oauthController.startOAuth);
router.get('/profile/callback', oauthController.handleCallback);

router.post('/customers/complete-onboarding',
  body('customer_id').isInt(),
  onboardingController.completeOnboarding
);

router.get('/customers/:customer_id/status', onboardingController.getStatus);

module.exports = router;
