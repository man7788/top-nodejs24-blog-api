const authController = require('../../../src/controllers/authController');
const { validationResult } = require('express-validator');
const db = require('../../../src/services/queries/userQuery');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// To mock a named export, use the factory function pattern in jest.mock()
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('../../../src/middlewares/validators/authValidator', () => ({
  validateLogin: jest.fn(),
}));

const bufferSpy = jest.spyOn(Buffer, 'from');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../../src/services/queries/userQuery', () => ({
  readUserByEmail: jest.fn(),
}));

beforeEach(async () => {
  res = {
    // Allow chaining of .status().json()
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
});

afterEach(async () => {
  jest.clearAllMocks();
});

describe(`Post login controller`, () => {
  test('response with form validation error', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => false,
      array: () => [
        { path: 'email', msg: 'Email must not be empty.' },
        { path: 'password', msg: 'Password must not be empty.' },
      ],
    }));

    const req = {};

    // Second anonymous function of "postBlogPost" controller array
    await authController.postLogin[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 400,
        message: 'Login form validation failed.',
        details: [
          { field: 'email', message: 'Email must not be empty.' },
          { field: 'password', message: 'Password must not be empty.' },
        ],
      },
    });
  });

  test('response with error if user not found', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    db.readUserByEmail.mockReturnValue(null);

    const req = { body: { email: 'foo@bar.com', password: 'foobar' } };

    // Second anonymous function of "postBlogPost" controller array
    await authController.postLogin[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 401,
        message: 'Invalid email or password.',
        details: [{ field: 'generic', message: 'Invalid email or password.' }],
      },
    });
  });

  test('response with error if password invalid', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    bcrypt.compare.mockResolvedValue(false);

    db.readUserByEmail.mockReturnValue({ id: 1 });

    const req = { body: { email: 'foo@bar.com', password: 'foobar' } };

    // Second anonymous function of "postBlogPost" controller array
    await authController.postLogin[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 401,
        message: 'Invalid email or password.',
        details: [{ field: 'generic', message: 'Invalid email or password.' }],
      },
    });
  });

  test('response with jwt token', async () => {
    process.env.JWT_PRIV_KEY = 'mockedPrivateKey';
    process.env.JWT_EXPIRE_TIME = '1h';

    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    bcrypt.compare.mockResolvedValue(true);

    bufferSpy.mockImplementation(() => ({
      // Mock the toString method of the returned object
      toString: jest.fn(() => 'mocked string'),
    }));

    const mockedToken = 'mockedToken';
    jwt.sign.mockReturnValue(mockedToken);

    db.readUserByEmail.mockReturnValue({
      id: 1,
      username: 'foobar',
    });

    const req = { body: { email: 'foo@bar.com', password: 'foobar' } };

    // Second anonymous function of "postBlogPost" controller array
    await authController.postLogin[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        token: mockedToken,
      },
    });
  });
});
