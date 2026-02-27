const oauthService = require('../../services/oauthService');

exports.startOAuth = (req, res) => {
  const { customer_id, return_url } = req.query;
  if (!customer_id) {
    return res.status(400).json({ success: false, error: 'customer_id required' });
  }
  const url = oauthService.generateAuthUrl(customer_id);
  // When return_url=1, return JSON so Swagger/fetch can use the URL without following redirect (avoids CORS)
  if (return_url === '1' || return_url === 'true') {
    return res.json({ success: true, url });
  }
  res.redirect(url);
};

exports.handleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).send('Missing code or state');
    }
    const result = await oauthService.handleCallback(code, state);
    res.redirect(`${process.env.FRONTEND_URL}/onboarding/success?customer_id=${result.customerId}`);
  } catch (error) {
    next(error);
  }
};
