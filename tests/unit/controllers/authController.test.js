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
  hash: jest.fn(),
}));

jest.mock('../../../src/middlewares/validators/authValidator', () => ({
  validateLogin: jest.fn(),
  validateProfile: jest.fn(),
}));

const bufferSpy = jest.spyOn(Buffer, 'from');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../../src/services/queries/userQuery', () => ({
  readUserByEmail: jest.fn(),
  updateUserById: jest.fn(),
  readUserPasswordById: jest.fn(),
  updateUserPasswordById: jest.fn(),
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

describe(`Get auth controller`, () => {
  test('response with user data', async () => {
    const user = {
      id: 1,
      email: 'foo@bar.com',
      name: 'foobar',
      admin: true,
    };

    const req = { user };

    authController.getAuth(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        user,
      },
    });
  });
});

describe(`Patch profile controller`, () => {
  test('response with form validation error', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => false,
      array: () => [{ path: 'name', msg: 'Name must not be empty.' }],
    }));

    const req = {};

    await authController.patchProfile[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 400,
        message: 'Update form validation failed.',
        details: [{ field: 'name', message: 'Name must not be empty.' }],
      },
    });
  });

  test('response with profile patch result', async () => {
    const user = {
      id: 1,
      email: 'foo@bar.com',
      name: 'john doe',
      admin: true,
    };

    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    db.updateUserById.mockReturnValue(user);

    const req = { user, body: { name: 'john doe' } };

    await authController.patchProfile[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        user,
      },
    });
  });
});

describe(`Patch password controller`, () => {
  test('response with form validation error (current password)', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => false,
      array: () => [
        { path: 'currentPassword', msg: 'Current password must not be empty.' },
      ],
    }));

    const req = {};

    await authController.patchPassword[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 400,
        message: 'Update form validation failed.',
        details: [
          {
            field: 'currentPassword',
            message: 'Current password must not be empty.',
          },
        ],
      },
    });
  });

  test('response with error if password invalid', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    bcrypt.compare.mockResolvedValue(false);

    const req = {
      user: { id: 1 },
      body: {
        currentPassword: 'foobar',
        newPassword: 'newfoobar',
        passwordConfimration: 'newfoobar',
      },
    };

    await authController.patchPassword[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 401,
        message: 'Invalid password.',
        details: [{ field: 'currentPassword', message: 'Invalid password.' }],
      },
    });
  });

  test('response with form validation error (new password)', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => false,
      array: () => [
        { path: 'newPassword', msg: 'New password must not be empty.' },
        {
          path: 'passwordConfirmation',
          msg: 'Password confrimation must not be empty.',
        },
      ],
    }));

    const req = {};

    await authController.patchPassword[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 400,
        message: 'Update form validation failed.',
        details: [
          { field: 'newPassword', message: 'New password must not be empty.' },
          {
            field: 'passwordConfirmation',
            message: 'Password confrimation must not be empty.',
          },
        ],
      },
    });
  });

  test('response with password patch result', async () => {
    const user = {
      id: 1,
      email: 'foo@bar.com',
      name: 'john doe',
      admin: true,
    };

    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    bcrypt.compare.mockResolvedValue(true);

    const req = {
      user: { id: 1 },
      body: {
        currentPassword: 'foobar',
        newPassword: 'newfoobar',
        passwordConfimration: 'newfoobar',
      },
    };

    db.updateUserPasswordById.mockResolvedValue(user);

    await authController.patchPassword[3](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        user,
      },
    });
  });
});
