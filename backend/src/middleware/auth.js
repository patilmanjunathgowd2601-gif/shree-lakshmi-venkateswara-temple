const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Admin login required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Devotee accounts (routes/users.js) are signed with the same JWT_SECRET
    // as admin accounts, so a valid signature alone isn't enough here - a
    // devotee's own, legitimately-issued token would otherwise also pass.
    // Require the admin-only role claim explicitly.
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    req.admin = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}

module.exports = { requireAdmin };
