const { Customer, Order, MonthlyReport, sequelize } = require('../../models');

exports.getDashboard = async (req, res, next) => {
  try {
    const [customerCounts, orderCounts, reportCount, recentCustomers, recentReports] = await Promise.all([
      Customer.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('customer_id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      Order.findAll({
        attributes: ['payment_status', [sequelize.fn('COUNT', sequelize.col('order_id')), 'count']],
        group: ['payment_status'],
        raw: true,
      }),
      MonthlyReport.count(),
      Customer.findAll({
        attributes: ['customer_id', 'business_name', 'status', 'whatsapp_phone', 'created_at'],
        include: [
          {
            model: Order,
            attributes: ['order_type', 'payment_status', 'created_at'],
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
      MonthlyReport.findAll({
        attributes: ['report_id', 'customer_id', 'report_month', 'status', 'new_reviews_count', 'avg_rating_month'],
        include: [{ model: Customer, attributes: ['business_name'] }],
        order: [['report_month', 'DESC']],
        limit: 5,
      }),
    ]);

    const customersByStatus = {};
    let totalCustomers = 0;
    customerCounts.forEach((row) => {
      customersByStatus[row.status] = parseInt(row.count, 10);
      totalCustomers += parseInt(row.count, 10);
    });

    const ordersByStatus = {};
    let totalOrders = 0;
    orderCounts.forEach((row) => {
      ordersByStatus[row.payment_status] = parseInt(row.count, 10);
      totalOrders += parseInt(row.count, 10);
    });

    res.json({
      success: true,
      data: {
        customers: {
          total: totalCustomers,
          by_status: customersByStatus,
        },
        orders: {
          total: totalOrders,
          by_status: ordersByStatus,
        },
        reports: {
          total: reportCount,
        },
        recent_customers: recentCustomers,
        recent_reports: recentReports,
      },
    });
  } catch (error) {
    next(error);
  }
};
