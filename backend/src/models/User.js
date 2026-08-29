const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Devotee accounts - deliberately a separate model/collection from Admin, so
// public self-registration can never grant admin access just by sharing the
// same JWT secret (see requireAdmin's role check in middleware/auth.js).
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
};

module.exports = mongoose.model('User', userSchema);
