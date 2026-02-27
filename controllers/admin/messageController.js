const whatsappService = require('../../services/whatsappService');
const { MessageLog } = require('../../models');

exports.sendReport = async (req, res, next) => {
  try {
    const { report_id } = req.params;
    const { to_phone } = req.body;
    const result = await whatsappService.sendWhatsApp(report_id, to_phone, req.admin.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.listLogs = async (req, res, next) => {
  try {
    const logs = await MessageLog.findAll({
      where: req.query,
      order: [['created_at', 'DESC']],
      limit: 100
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
