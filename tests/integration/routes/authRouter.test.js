const prisma = require('../../../src/config/prisma/client');
const authRouter = require('../../../src/routes/authRouter');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/', authRouter);

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const bufferSpy = jest.spyOn(Buffer, 'from');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('passport', () => ({
  use: jest.fn(),
  // authenticate: jest.fn(),
  authenticate: jest.fn(() => (req, res, next) => {
    req.user = {
      id: 1,
      email: 'foo@bar.com',
      name: 'foobar',
      admin: true,
    };
    next();
  }),
}));

afterEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await prisma.user.deleteMany();
});

describe(`POST '/login'`, () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
    await prisma.user.create({
      data: {
        id: 1,
        email: 'foo@bar.com',
        name: 'foobar',
        password: 'foobar123',
        admin: true,
      },
    });
  });

  test('response form validation error', async () => {
    const response = await request(app).post('/login');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: expect.any(String),
        details: [
          { field: 'email', message: expect.any(String) },

          { field: 'password', message: expect.any(String) },
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

  test('response with jwt token', async () => {
    bcrypt.compare.mockResolvedValue(true);

    // Use mockImplementationOnce to prevent overriding other use of Buffer.from
    bufferSpy.mockImplementationOnce(() => ({
      // Mock the toString method of the returned object
      toString: jest.fn(() => 'mockedString'),
    }));

    jwt.sign.mockReturnValue('mockedToken');

    const payload = { email: 'foo@bar.com', password: 'foobar123' };

    const response = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        token: expect.any(String),
      },
    });
  });
});

describe(`GET '/auth'`, () => {
  test('response with user data', async () => {
    const response = await request(app).get('/auth');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        user: {
          id: 1,
          email: expect.any(String),
          name: expect.any(String),
          admin: expect.any(Boolean),
        },
      },
    });
  });
});

describe(`PATCH '/profile'`, () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
    await prisma.user.create({
      data: {
        id: 1,
        email: 'foo@bar.com',
        name: 'foobar',
        password: 'foobar123',
        admin: true,
      },
    });
  });

  test('response with form validation error', async () => {
    const response = await request(app).patch('/profile');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: expect.any(String),
        details: [
          {
            field: 'name',
            message: expect.any(String),
          },
        ],
      },
    });
  });

  test('response with updated user', async () => {
    const payload = { name: 'john doe' };

    const response = await request(app)
      .patch('/profile')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        user: {
          id: 1,
          email: expect.any(String),
          name: 'john doe',
          admin: expect.any(Boolean),
        },
      },
    });
  });
});

describe(`PATCH '/password'`, () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
    await prisma.user.create({
      data: {
        id: 1,
        email: 'foo@bar.com',
        name: 'foobar',
        password: 'foobar123',
        admin: true,
      },
    });
  });

  test('response with form validation error', async () => {
    const response = await request(app).patch('/password');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: expect.any(String),
        details: [
          {
            field: 'currentPassword',
            message: expect.any(String),
          },
          {
            field: 'newPassword',
            message: expect.any(String),
          },
          {
            field: 'passwordConfirmation',
            message: expect.any(String),
          },
        ],
      },
    });
  });

  test('response with error if passwords do not match', async () => {
    const payload = {
      currentPassword: 'foobar123',
      newPassword: 'newfoobar',
      passwordConfirmation: 'wrongfoobar',
    };

    const response = await request(app)
      .patch('/password')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: expect.any(String),
        details: [
          {
            field: 'passwordConfirmation',
            message: expect.any(String),
          },
        ],
      },
    });
  });

  test('response with error if password invalid', async () => {
    const payload = {
      currentPassword: 'foobar',
      newPassword: 'newfoobar',
      passwordConfirmation: 'newfoobar',
    };

    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .patch('/password')
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
            field: 'currentPassword',
            message: expect.any(String),
          },
        ],
      },
    });
  });

  test('response with updated password', async () => {
    const payload = {
      currentPassword: 'foobar123',
      newPassword: 'newfoobar',
      passwordConfirmation: 'newfoobar',
    };

    bcrypt.compare.mockResolvedValue(true);
    const response = await request(app)
      .patch('/password')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        user: {
          id: 1,
          email: expect.any(String),
          name: 'foobar',
          admin: expect.any(Boolean),
        },
      },
    });
  });
});
