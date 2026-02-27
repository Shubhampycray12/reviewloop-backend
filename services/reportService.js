const { Review, MonthlyReport, Customer, Subscription, JobRunLog } = require('../models');
const { Op, sequelize } = require('sequelize');
const logger = require('../utils/logger');

exports.buildReportsForMonth = async (month) => {
  // month format: YYYY-MM
  const startDate = new Date(month + '-01');
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const activeCustomers = await Customer.findAll({
    where: { status: 'ACTIVE' },
    include: {
      model: Subscription,
      required: true,
      where: { status: 'ACTIVE' }
    }
  });

  let created = 0, updated = 0;

  for (const customer of activeCustomers) {
    // Aggregate reviews for the month
    const stats = await Review.findOne({
      where: {
        customer_id: customer.customer_id,
        review_time: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('review_id')), 'new_reviews_count'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating_month'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating <= 3 THEN 1 ELSE 0 END')), 'low_rating_count']
      ],
      raw: true
    });

    // Previous month average for rating_change
    const prevMonth = new Date(startDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthEnd = new Date(startDate);
    const prevStats = await Review.findOne({
      where: {
        customer_id: customer.customer_id,
        review_time: { [Op.between]: [prevMonth, prevMonthEnd] }
      },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'prev_avg']],
      raw: true
    });

    const ratingChange = (stats.avg_rating_month && prevStats.prev_avg)
      ? (parseFloat(stats.avg_rating_month) - parseFloat(prevStats.prev_avg)).toFixed(2)
      : 0;

    const [report, createdFlag] = await MonthlyReport.upsert({
      customer_id: customer.customer_id,
      report_month: startDate,
      new_reviews_count: stats.new_reviews_count || 0,
      avg_rating_month: stats.avg_rating_month || 0,
      low_rating_count: stats.low_rating_count || 0,
      rating_change: ratingChange,
      status: 'DRAFT',
      generated_at: new Date(),
    });

    if (createdFlag) created++; else updated++;
  }

  await JobRunLog.create({
    job_name: 'REPORT_BUILD',
    status: 'SUCCESS',
    run_month: month,
    started_at: new Date(),
    finished_at: new Date(),
  });

  return { created, updated };
};
