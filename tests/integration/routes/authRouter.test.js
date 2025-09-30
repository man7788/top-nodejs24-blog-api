const authRouter = require('../../../src/routes/authRouter');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/', authRouter);

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

const bufferSpy = jest.spyOn(Buffer, 'from');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

afterEach(async () => {
  jest.clearAllMocks();
});

describe(`POST '/login'`, () => {
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

    const payload = { email: 'foo@bar.com', password: 'foobar' };

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
