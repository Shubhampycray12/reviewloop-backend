const { MonthlyReport, ReportSummary, Customer } = require('../../models');

exports.listReports = async (req, res, next) => {
  try {
    const { month, status } = req.query;
    const where = {};
    if (month) where.report_month = month + '-01'; // normalize
    if (status) where.status = status;

    const reports = await MonthlyReport.findAll({
      where,
      include: [{ model: Customer, attributes: ['business_name', 'whatsapp_phone'] }],
      order: [['report_month', 'DESC'], ['customer_id', 'ASC']]
    });
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const report = await MonthlyReport.findByPk(req.params.report_id, {
      include: [
        { model: Customer, attributes: ['business_name', 'whatsapp_phone'] },
        { model: ReportSummary }
      ]
    });
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

exports.upsertSummary = async (req, res, next) => {
  try {
    const { summary_text, next_action_text } = req.body;
    const report = await MonthlyReport.findByPk(req.params.report_id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

    const [summary, created] = await ReportSummary.upsert({
      report_id: report.report_id,
      summary_text,
      next_action_text,
      created_by: req.admin.email,
    });

    await report.update({ status: 'SUMMARY_ADDED' });

    res.json({ success: true, data: { report_id: report.report_id, status: report.status } });
  } catch (error) {
    next(error);
  }
};
