const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/Notice');
const Notice = require('../models/Notice');
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

function adminToken() {
  return jwt.sign({ id: 'admin1', role: 'admin' }, process.env.JWT_SECRET);
}

function devoteeToken() {
  return jwt.sign({ id: 'user1', role: 'devotee' }, process.env.JWT_SECRET);
}

describe('GET /api/notices', () => {
  it('returns notices without needing a token', async () => {
    Notice.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    const res = await request(app).get('/api/notices');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(Notice.find).toHaveBeenCalled();
  });
});

describe('POST /api/notices', () => {
  it('rejects creating a notice without a token', async () => {
    const res = await request(app).post('/api/notices').send({ title: 'Test Notice' });
    expect(res.status).toBe(401);
    expect(Notice.create).not.toHaveBeenCalled();
  });

  it('rejects a devotee token - devotees are not admins', async () => {
    const res = await request(app)
      .post('/api/notices')
      .set('Authorization', `Bearer ${devoteeToken()}`)
      .send({ title: 'Test Notice' });

    expect(res.status).toBe(403);
    expect(Notice.create).not.toHaveBeenCalled();
  });

  it('creates a notice with a valid admin token', async () => {
    Notice.create.mockResolvedValue({ _id: 'n1', title: 'Test Notice' });

    const res = await request(app)
      .post('/api/notices')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Test Notice' });

    expect(res.status).toBe(201);
    expect(Notice.create).toHaveBeenCalled();
  });
});
