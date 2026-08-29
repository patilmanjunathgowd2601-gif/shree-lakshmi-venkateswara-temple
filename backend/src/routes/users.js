const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const router = express.Router();

function signUserToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: 'devotee' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/users/register - public devotee self-registration
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required.');
    }
    if (password.length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters long.');
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409);
      throw new Error('An account with that email already exists.');
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email: normalizedEmail, passwordHash });

    res.status(201).json({
      token: signUserToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  })
);

// POST /api/users/login - devotee login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    res.json({
      token: signUserToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  })
);

module.exports = router;
