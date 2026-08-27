const request = require('supertest');

jest.mock('../models/Event');
const Event = require('../models/Event');
const createApp = require('../app');

let app;

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.CORS_ORIGIN = '*';
  app = createApp();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/events', () => {
  it('returns whatever the Event model returns, without needing a token', async () => {
    Event.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(Event.find).toHaveBeenCalled();
  });
});

describe('POST /api/events', () => {
  it('rejects creating an event without an admin token', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ title: 'Test Event', date: new Date().toISOString() });

    expect(res.status).toBe(401);
    expect(Event.create).not.toHaveBeenCalled();
  });

  it('rejects a garbage token', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ title: 'Test Event', date: new Date().toISOString() });

    expect(res.status).toBe(401);
  });
});
