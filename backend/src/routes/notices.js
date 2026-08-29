const express = require('express');
const asyncHandler = require('express-async-handler');
const Notice = require('../models/Notice');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/notices - public list, newest first
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const notices = await Notice.find().sort({ publishedAt: -1 });
    res.json(notices);
  })
);

// POST /api/notices - admin only
router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, body, priority, publishedAt } = req.body;
    if (!title) {
      res.status(400);
      throw new Error('Title is required.');
    }
    const notice = await Notice.create({ title, body, priority, publishedAt });
    res.status(201).json(notice);
  })
);

// PUT /api/notices/:id - admin only
router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }
    res.json(notice);
  })
);

// DELETE /api/notices/:id - admin only
router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }
    res.json({ message: 'Notice deleted' });
  })
);

module.exports = router;
