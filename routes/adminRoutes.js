const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyAdmin } = require('../middleware/auth');
const authController = require('../controllers/admin/authController');
const dashboardController = require('../controllers/admin/dashboardController');
const customerController = require('../controllers/admin/customerController');
const reportController = require('../controllers/admin/reportController');
const messageController = require('../controllers/admin/messageController');
const subscriptionController = require('../controllers/admin/subscriptionController');

const loginRegisterValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Auth
router.post('/auth/register', loginRegisterValidation, authController.register);
router.post('/auth/login', loginRegisterValidation, authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', verifyAdmin, authController.me);

// Dashboard
router.get('/dashboard', verifyAdmin, dashboardController.getDashboard);

// Customers
router.get('/customers', verifyAdmin, customerController.listCustomers);
router.get('/customers/:customer_id', verifyAdmin, customerController.getCustomer);
router.patch('/customers/:customer_id', verifyAdmin, customerController.updateCustomer);
router.post('/customers/:customer_id/complete-onboarding', verifyAdmin, customerController.completeOnboarding);

// Reports
router.get('/reports', verifyAdmin, reportController.listReports);
router.get('/reports/:report_id', verifyAdmin, reportController.getReport);
router.post('/reports/:report_id/summary', verifyAdmin, reportController.upsertSummary);

// WhatsApp
router.post('/reports/:report_id/send-whatsapp', verifyAdmin, messageController.sendReport);
router.get('/message-logs', verifyAdmin, messageController.listLogs);

// Subscriptions
router.post('/customers/:customer_id/subscriptions/cancel', verifyAdmin, subscriptionController.cancel);

module.exports = router;
