const request = require('supertest');
const app = require('../src/index');

describe('API Health Check', () => {
  test('GET /health should return ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

describe('Services API', () => {
  test('GET /api/services should return service list', async () => {
    const response = await request(app).get('/api/services');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe('Housekeepers API', () => {
  test('GET /api/housekeepers should return housekeeper list', async () => {
    const response = await request(app)
      .get('/api/housekeepers')
      .query({ page: 1, limit: 10 });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('items');
    expect(response.body.data).toHaveProperty('pagination');
  });

  test('GET /api/housekeepers with filters', async () => {
    const response = await request(app)
      .get('/api/housekeepers')
      .query({
        page: 1,
        limit: 5,
        minPrice: 30,
        maxPrice: 100,
        rating: 4.5,
        sort: 'rating'
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('Auth API', () => {
  test('POST /api/auth/send-code should validate phone', async () => {
    const response = await request(app)
      .post('/api/auth/send-code')
      .send({ phone: 'invalid' });
    expect(response.status).toBe(400);
  });

  test('POST /api/auth/send-code with valid phone', async () => {
    const response = await request(app)
      .post('/api/auth/send-code')
      .send({ phone: '13800138000' });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /api/auth/register should validate input', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ phone: 'invalid', password: '123' });
    expect(response.status).toBe(400);
  });

  test('POST /api/auth/login should validate input', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ phone: 'invalid', password: '' });
    expect(response.status).toBe(400);
  });
});

describe('Protected Routes', () => {
  test('GET /api/auth/me without token should fail', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  test('GET /api/orders without token should fail', async () => {
    const response = await request(app).get('/api/orders');
    expect(response.status).toBe(401);
  });

  test('GET /api/addresses without token should fail', async () => {
    const response = await request(app).get('/api/addresses');
    expect(response.status).toBe(401);
  });

  test('GET /api/reviews without token should fail', async () => {
    const response = await request(app).get('/api/reviews');
    expect(response.status).toBe(401);
  });
});

describe('Orders API', () => {
  test('POST /api/orders should validate input', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({});
    expect(response.status).toBe(401);
  });
});

describe('Error Handling', () => {
  test('GET /api/nonexistent should return 404', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
  });
});
