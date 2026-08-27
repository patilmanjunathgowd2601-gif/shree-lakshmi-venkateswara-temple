const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    time: { type: String, default: '' }, // e.g. "6:00 AM - 8:00 PM"
    category: {
      type: String,
      enum: ['festival', 'pooja', 'seva', 'cultural', 'other'],
      default: 'other',
    },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
