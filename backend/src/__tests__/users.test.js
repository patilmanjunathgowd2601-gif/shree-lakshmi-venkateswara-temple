const request = require('supertest');

jest.mock('../models/User');
const User = require('../models/User');
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

describe('POST /api/users/register', () => {
  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/users/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(User.create).not.toHaveBeenCalled();
  });

  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Dev A', email: 'a@b.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email', async () => {
    User.findOne.mockResolvedValue({ _id: '1', email: 'a@b.com' });

    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Dev A', email: 'a@b.com', password: 'longenough1' });

    expect(res.status).toBe(409);
    expect(User.create).not.toHaveBeenCalled();
  });

  it('creates a new devotee account and returns a token', async () => {
    User.findOne.mockResolvedValue(null);
    User.hashPassword.mockResolvedValue('hashed-password');
    User.create.mockResolvedValue({ _id: 'u1', name: 'Dev A', email: 'a@b.com' });

    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Dev A', email: 'a@b.com', password: 'longenough1' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toEqual({ id: 'u1', name: 'Dev A', email: 'a@b.com' });
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Dev A', email: 'a@b.com', passwordHash: 'hashed-password' })
    );
  });
});

describe('POST /api/users/login', () => {
  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/users/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  it('rejects an unknown email', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'nope@b.com', password: 'whatever1' });
    expect(res.status).toBe(401);
  });

  it('rejects an incorrect password', async () => {
    User.findOne.mockResolvedValue({ comparePassword: jest.fn().mockResolvedValue(false) });
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'a@b.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('logs in successfully with correct credentials', async () => {
    User.findOne.mockResolvedValue({
      _id: 'u1',
      name: 'Dev A',
      email: 'a@b.com',
      comparePassword: jest.fn().mockResolvedValue(true),
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'a@b.com', password: 'correctpass' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toEqual({ id: 'u1', name: 'Dev A', email: 'a@b.com' });
  });
});
