const request = require('supertest');
const createApp = require('../app');

let app;

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.CORS_ORIGIN = '*';
  app = createApp();
});

describe('GET /metrics', () => {
  it('exposes Prometheus text-format metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toMatch(/http_request_duration_seconds/);
    expect(res.text).toMatch(/temple_donations_total/);
  });
});
