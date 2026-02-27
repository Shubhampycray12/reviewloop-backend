const { Customer, Subscription, ProfileConnection, Review, JobRunLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { google } = require('googleapis');

exports.pullReviewsForMonth = async (month) => {
  // Find all active customers with active subscriptions and connected profile
  const customers = await Customer.findAll({
    where: { status: 'ACTIVE' },
    include: [
      {
        model: Subscription,
        required: true,
        where: { status: 'ACTIVE' }
      },
      {
        model: ProfileConnection,
        required: true,
        where: { status: 'CONNECTED', provider: 'GOOGLE' }
      }
    ]
  });

  let successCount = 0, failCount = 0;

  for (const customer of customers) {
    try {
      const connection = customer.ProfileConnection;
      // Setup Google client with refresh token (decrypt in real code)
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        refresh_token: connection.refresh_token_encrypted // decrypt first
      });

      // Google My Business v4 was removed from googleapis. Reviews may require
      // a separate integration (e.g. Business Profile API). For now, no-op.
      const reviews = [];

      for (const review of reviews) {
        await Review.findOrCreate({
          where: { provider_review_id: review.reviewId },
          defaults: {
            customer_id: customer.customer_id,
            provider: 'GOOGLE',
            rating: review.starRating,
            comment: review.comment,
            review_time: review.createTime,
            raw_json: review,
          }
        });
      }
      successCount++;
    } catch (err) {
      logger.error(`Review pull failed for customer ${customer.customer_id}`, err);
      failCount++;
    }
  }

  await JobRunLog.create({
    job_name: 'REVIEW_PULL',
    status: failCount > 0 ? (successCount > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS',
    run_month: month,
    started_at: new Date(),
    finished_at: new Date(),
    error_message: failCount > 0 ? `${failCount} customers failed` : null,
  });

  return { successCount, failCount };
};
