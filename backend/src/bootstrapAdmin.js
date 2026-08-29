const Admin = require('./models/Admin');

// Creates the bootstrap admin account if it doesn't already exist. Safe to
// call on every process start (idempotent) - this is what lets the account
// get created automatically on platforms like Render's free tier, where
// one-off Jobs and pre-deploy commands both require a paid instance type and
// so can't be used to run `npm run seed` as a separate step.
async function ensureAdminSeeded() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@srilakshmivenkateswara.org').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-immediately';

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await Admin.hashPassword(adminPassword);
    await Admin.create({ name: 'Temple Admin', email: adminEmail, passwordHash });
    console.log(`Created admin account: ${adminEmail}`);
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }
}

module.exports = ensureAdminSeeded;
