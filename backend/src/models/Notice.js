const mongoose = require('mongoose');

// Short announcements/notices shown on the homepage notice board, e.g.
// "Temple closed Monday for maintenance" or "New darshan timings from Diwali".
const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['normal', 'important'],
      default: 'normal',
    },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

noticeSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
