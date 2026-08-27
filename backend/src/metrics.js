const client = require('prom-client');

// A dedicated registry (rather than the global default) keeps this explicit
// and easy to unit test in isolation.
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// Custom, domain-specific metrics - the kind of thing you'd actually build a
// Grafana panel around, rather than generic infrastructure numbers.
const donationsTotal = new client.Counter({
  name: 'temple_donations_total',
  help: 'Total number of successfully verified donations',
  registers: [register],
});

const donationsAmountTotalInr = new client.Counter({
  name: 'temple_donations_amount_total_inr',
  help: 'Total amount (INR) received via successfully verified donations',
  registers: [register],
});

function metricsMiddleware(req, res, next) {
  const endTimer = httpRequestDuration.startTimer();
  res.on('finish', () => {
    endTimer({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });
  });
  next();
}

module.exports = {
  register,
  metricsMiddleware,
  donationsTotal,
  donationsAmountTotalInr,
};
