const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin } = require('../../models');
const { validationResult } = require('express-validator');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;

    const count = await Admin.count();
    if (count > 0) {
      return res.status(403).json({
        success: false,
        error: 'An admin already exists. Registration is only allowed for the first admin.',
      });
    }

    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, password_hash });

    const token = jwt.sign(
      { admin_id: admin.admin_id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.status(201).json({
      success: true,
      data: {
        token,
        admin: { admin_id: admin.admin_id, email: admin.email },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (admin) {
      const valid = await bcrypt.compare(password, admin.password_hash);
      if (valid) {
        const token = jwt.sign(
          { admin_id: admin.admin_id, email: admin.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({
          success: true,
          data: { token, admin: { admin_id: admin.admin_id, email: admin.email } },
        });
      }
    }

    // Legacy: allow env-based admin if no DB admins yet
    const envEmail = process.env.ADMIN_EMAIL || 'admin@reviewloop.in';
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envPassword && email === envEmail && password === envPassword) {
      const token = jwt.sign({ email: envEmail }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, data: { token, admin: { email: envEmail } } });
    }

    res.status(401).json({ success: false, error: 'Invalid credentials' });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.json({ success: true });
};

exports.me = (req, res) => {
  res.json({ success: true, data: { admin: req.admin } });
};
