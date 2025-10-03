const { Router } = require('express');
const customJwtAuth = require('../../../../src/middlewares/passport/customAuth.js');
const passport = require('passport');
const errorHandler = require('../../../../src/middlewares/errors/errorHandler');

const jwtRouter = Router();
jwtRouter.get('/', customJwtAuth, (req, res, next) => {
  res.status(200).json({ status: 'success' });
});

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/', jwtRouter);
app.use(errorHandler);

passport.authenticate = jest.fn();

jest.spyOn(console, 'error').mockImplementation(() => {});

afterEach(async () => {
  jest.clearAllMocks();
});

describe(`GET '/'`, () => {
  test('return next with error', async () => {
    const error = {
      status: 'error',
      error: {
        code: 500,
        message: 'Unexpected authentication error.',
      },
    };

    passport.authenticate.mockImplementation(
      (authType, options, callback) => () => {
        callback(error, null);
      },
    );

    const response = await request(app).get('/');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(500);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 500,
        message: expect.any(String),
      },
    });
  });
});
