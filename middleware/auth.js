const jwt = require('jsonwebtoken');

exports.verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

exports.verifyInternalKey = (req, res, next) => {
  const key = req.headers['x-internal-api-key'];
  if (key !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  next();
};
