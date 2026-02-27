const { google } = require('googleapis');
const { ProfileConnection } = require('../models');
const logger = require('../utils/logger');

const SCOPES = ['https://www.googleapis.com/auth/business.manage'];
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env (from Google Cloud Console → Credentials)'
    );
  }
  return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
}

exports.generateAuthUrl = (customerId) => {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: Buffer.from(JSON.stringify({ customerId })).toString('base64'),
    prompt: 'consent',
  });
};

function parseState(state) {
  try {
    const decoded = Buffer.from(state, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    if (parsed == null || typeof parsed.customerId === 'undefined') {
      throw new Error('Invalid state: missing customerId');
    }
    return parsed.customerId;
  } catch (e) {
    const err = new Error('Invalid state parameter');
    err.status = 400;
    err.code = 'INVALID_STATE';
    throw err;
  }
}

exports.handleCallback = async (code, state) => {
  const customerId = parseState(state);
  const oauth2Client = getOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  try {
    // Real Google Business Profile APIs – required for actual account/location data
    const accountMgmt = google.mybusinessaccountmanagement({ version: 'v1', auth: oauth2Client });
    const accountsRes = await accountMgmt.accounts.list({});
    const accounts = accountsRes.data.accounts || [];
    const account = accounts[0];
    if (!account || !account.name) {
      const err = new Error('No Google Business account found for this user');
      err.status = 400;
      err.code = 'NO_ACCOUNT';
      throw err;
    }

    const businessInfo = google.mybusinessbusinessinformation({ version: 'v1', auth: oauth2Client });
    const locationsRes = await businessInfo.accounts.locations.list({
      parent: account.name,
      readMask: 'name',
    });
    const locations = locationsRes.data.locations || [];
    const location = locations[0];
    const locationId = location ? location.name : null;

    await ProfileConnection.upsert({
      customer_id: customerId,
      provider: 'GOOGLE',
      status: 'CONNECTED',
      refresh_token_encrypted: tokens.refresh_token,
      token_expiry: new Date(tokens.expiry_date),
      account_id: account.name,
      location_id: locationId,
    });

    return { success: true, customerId };
  } catch (error) {
    logger.error('OAuth callback error', error);
    if (error.status === 400) throw error;

    const status = error.response?.status ?? error.status;
    const data = error.response?.data;
    const quotaValue = data?.error?.details?.find?.(
      (d) => d['@type']?.includes('ErrorInfo') && d.metadata?.quota_limit_value
    )?.metadata?.quota_limit_value;

    let message = 'Authorization failed. Please try connecting again.';
    let errCode = 'OAUTH_FAILED';
    let httpStatus = 400;

    if (status === 429 || (data?.error?.errors?.[0]?.reason === 'rateLimitExceeded')) {
      httpStatus = 429;
      errCode = 'RATE_LIMIT_EXCEEDED';
      message =
        quotaValue === '0'
          ? 'Google Business API has no quota for this project. Request access: Google Cloud Console → APIs & Services → My Business Account Management API → Quotas (or apply for Google Business Profile API access).'
          : 'Google Business API rate limit reached. Please try again in a minute.';
    } else if (status === 403) {
      httpStatus = 503;
      errCode = 'API_NOT_AVAILABLE';
      message =
        error.message?.includes('has not been used') || error.message?.includes('is disabled')
          ? 'Google Business API is not enabled for this project. Enable "My Business Account Management API" and "My Business Business Information API" in Google Cloud Console.'
          : 'Google Business API access denied. Check project permissions in Google Cloud Console.';
    }

    const err = new Error(message);
    err.status = httpStatus;
    err.code = errCode;
    throw err;
  }
};
