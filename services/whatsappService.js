const axios = require('axios');
const { MessageLog, Customer, MonthlyReport, ReportSummary } = require('../models');
const logger = require('../utils/logger');

exports.sendWhatsApp = async (reportId, toPhone = null, sentBy = 'system') => {
  const report = await MonthlyReport.findByPk(reportId, {
    include: [
      { model: Customer },
      { model: ReportSummary }
    ]
  });

  if (!report) throw new Error('Report not found');
  if (!report.ReportSummary) throw new Error('Report summary missing');

  const phone = toPhone || report.Customer.whatsapp_phone;
  const message = `*Review Summary for ${report.Customer.business_name}*\n\n` +
    `${report.ReportSummary.summary_text}\n\n` +
    `*Next actions:*\n${report.ReportSummary.next_action_text}`;

  try {
    // Call WhatsApp provider API (e.g., Twilio, Gupshup)
    // const response = await axios.post(...);
    // Simulate success
    const status = 'SENT';

    await MessageLog.create({
      customer_id: report.Customer.customer_id,
      report_id: reportId,
      to_phone: phone,
      message_text: message,
      status: status,
      sent_at: new Date(),
      sent_by: sentBy,
    });

    if (status === 'SENT') {
      await report.update({ status: 'SENT' });
    }

    return { success: true, status };
  } catch (error) {
    logger.error('WhatsApp send failed', error);
    await MessageLog.create({
      customer_id: report.Customer.customer_id,
      report_id: reportId,
      to_phone: phone,
      message_text: message,
      status: 'FAILED',
      sent_by: sentBy,
    });
    throw error;
  }
};
