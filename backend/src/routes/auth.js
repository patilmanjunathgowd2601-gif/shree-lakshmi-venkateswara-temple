const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');

const router = express.Router();

// POST /api/auth/login - admin login, returns a JWT used for admin-only routes
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required.');
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || !(await admin.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  })
);

module.exports = router;
