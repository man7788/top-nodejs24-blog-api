const prisma = require('../../../src/config/prisma/client');
const authRouter = require('../../../src/routes/authRouter');

const bcrypt = require('bcryptjs');

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/', authRouter);

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

afterEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await prisma.post.deleteMany();
});

describe(`POST '/login'`, () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
    await prisma.user.create({
      data: {
        email: 'foo@bar.com',
        name: 'namePlaceholder',
        password: 'passwordPlaceholder',
        admin: true,
      },
    });
  });

  test('response form validation error', async () => {
    const response = await request(app).post('/login');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body).toMatchObject({
      status: 'error',
      error: {
        code: 400,
        message: expect.any(String),
        details: [
          expect.objectContaining({
            field: 'email',
            message: expect.any(String),
          }),
          expect.objectContaining({
            field: 'password',
            message: expect.any(String),
          }),
        ],
      },
    });
  });

  test('response with error if user not found', async () => {
    const payload = { email: 'john@doe.com', password: 'foobar' };

    const response = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 401,
        message: expect.any(String),
        details: [
          {
            field: 'generic',
            message: expect.any(String),
          },
        ],
      },
    });
  });

  test('response with error if password invalid', async () => {
    bcrypt.compare.mockResolvedValue(false);

    const payload = { email: 'foo@bar.com', password: 'foobar' };

    const response = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 401,
        message: expect.any(String),
        details: [
          {
            field: 'generic',
            message: expect.any(String),
          },
        ],
      },
    });
  });
});
