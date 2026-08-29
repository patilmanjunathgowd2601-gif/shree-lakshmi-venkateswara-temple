require('dotenv').config();
const createApp = require('./app');
const connectDB = require('./config/db');
const ensureAdminSeeded = require('./bootstrapAdmin');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    // Best-effort bootstrap admin creation on every startup (idempotent -
    // see bootstrapAdmin.js). This replaces a separate `npm run seed` step
    // on platforms like Render's free tier, where one-off Jobs and
    // pre-deploy commands both require a paid instance type.
    try {
      await ensureAdminSeeded();
    } catch (err) {
      console.error('Admin bootstrap check failed (server will still start):', err.message);
    }

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Temple API server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
