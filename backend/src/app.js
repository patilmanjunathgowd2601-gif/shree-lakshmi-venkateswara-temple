const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const galleryRoutes = require('./routes/gallery');
const donationRoutes = require('./routes/donations');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { register, metricsMiddleware } = require('./metrics');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(metricsMiddleware);

  // Scraped by Prometheus (see k8s/backend/servicemonitor.yaml) - deliberately
  // outside /api so it isn't subject to the CORS/rate-limit rules below, which
  // are meant for browser traffic, not cluster-internal scraping.
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  const allowedOrigins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((origin) => origin.trim());
  app.use(
    cors({
      origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    })
  );

  // Basic protection against brute-forcing the admin login / hammering the API
  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
  app.use('/api', apiLimiter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', temple: 'Sri Lakshmi Venkateswara Temple' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/donations', donationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
