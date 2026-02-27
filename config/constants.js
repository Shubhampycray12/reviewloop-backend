module.exports = {
  PLAN_CODES: {
    PHYSICAL_KIT: 'PHYSICAL_KIT',
    STARTER_MONTHLY: 'STARTER_MONTHLY'
  },
  PLAN_CONFIG: {
    PHYSICAL_KIT: {
      oneTimePrice: 1999,
      monthlyPrice: 0,
      setupFee: 0,
      includes: ['QR Stand', 'Wall Poster', 'Bilingual Design', 'Print & delivery']
    },
    STARTER_MONTHLY: {
      oneTimePrice: 0,
      monthlyPrice: 399,
      setupFee: 999,
      includes: ['Physical Setup', 'Review monitoring', 'Monthly insights', 'WhatsApp alerts']
    }
  },
  CUSTOMER_STATUS: ['LEAD', 'PAID', 'ACTIVE', 'INACTIVE', 'CHURNED'],
  ORDER_TYPES: {
    PHYSICAL_KIT: 'PHYSICAL_KIT',
    STARTER_SETUP: 'STARTER_SETUP',
    SUBSCRIPTION_ACTIVATION: 'SUBSCRIPTION_ACTIVATION'
  },
  PAYMENT_STATUS: ['INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED'],
  SUBSCRIPTION_STATUS: ['ACTIVE', 'INACTIVE', 'CANCELLED'],
  PROFILE_CONNECTION_STATUS: ['CONNECTED', 'DISCONNECTED', 'EXPIRED', 'ERROR'],
  PROVIDERS: {
    GOOGLE: 'GOOGLE'
  },
  REPORT_STATUS: ['DRAFT', 'READY_FOR_SUMMARY', 'SUMMARY_ADDED', 'SENT'],
  LANGUAGES: ['EN', 'HI', 'MR'],
  JOB_NAMES: {
    REVIEW_PULL: 'REVIEW_PULL',
    REPORT_BUILD: 'REPORT_BUILD',
    RENEWAL_CHECK: 'RENEWAL_CHECK'
  }
};
