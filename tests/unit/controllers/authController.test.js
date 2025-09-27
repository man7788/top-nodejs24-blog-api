const authController = require('../../../src/controllers/authController');
const { validationResult } = require('express-validator');

// To mock a named export, use the factory function pattern in jest.mock()
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('../../../src/middlewares/validators/authValidator', () => ({
  validateLogin: jest.fn(),
}));

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

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = {};
    const res = mockResponse();

    // Second anonymous function of "postBlogPost" controller array
    await authController.postLogin[1](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);
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
});
