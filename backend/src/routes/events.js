const express = require('express');
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/events - public list, soonest first, optionally only upcoming
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.upcoming === 'true') {
      filter.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    }
    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  })
);

// GET /api/events/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    res.json(event);
  })
);

// POST /api/events - admin only
router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, description, date, time, category, imageUrl } = req.body;
    if (!title || !date) {
      res.status(400);
      throw new Error('Title and date are required.');
    }
    const event = await Event.create({ title, description, date, time, category, imageUrl });
    res.status(201).json(event);
  })
);

// PUT /api/events/:id - admin only
router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    res.json(event);
  })
);

// DELETE /api/events/:id - admin only
router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    res.json({ message: 'Event deleted' });
  })
);

module.exports = router;
