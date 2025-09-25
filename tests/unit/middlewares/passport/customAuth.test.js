const {
  customJwtAuth,
} = require('../../../../src/middlewares/passport/customAuth.js');
const passport = require('passport');

afterEach(async () => {
  jest.clearAllMocks();
});

passport.authenticate = jest.fn();

describe('customJwtAuth', () => {
  test('return next with error', async () => {
    const error = {
      status: 'error',
      error: {
        code: 500,
        message: 'Internal sever error',
      },
    };

    const req = {};
    const res = {};
    const next = jest.fn();

    passport.authenticate.mockImplementation(
      (authType, options, callback) => () => {
        callback(error, null);
      },
    );

    customJwtAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 500,
          message: 'Internal sever error',
        }),
      }),
    );
  });

  test('return error status 401 and error details info message', async () => {
    passport.authenticate.mockImplementation(
      (authType, options, callback) => () => {
        callback(null, false, { message: 'Error message' });
      },
    );

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = {};
    const res = mockResponse();
    const next = jest.fn();

    customJwtAuth(req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 401,
          message: 'Unauthorized',
          details: 'Error message',
        }),
      }),
    );
  });

  test('return error status 401 and fallback error details message', async () => {
    passport.authenticate.mockImplementation(
      (authType, options, callback) => () => {
        callback(null, false);
      },
    );

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = {};
    const res = mockResponse();
    const next = jest.fn();

    customJwtAuth(req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 401,
          message: 'Unauthorized',
          details: 'Invalid or expired token',
        }),
      }),
    );
  });

  test('assign req.user property and call next', async () => {
    passport.authenticate.mockImplementation(
      (authType, options, callback) => () => {
        callback(null, { id: 1 });
      },
    );

    const req = {};
    const res = {};
    const next = jest.fn();

    customJwtAuth(req, res, next);

    expect(req.user).toEqual({ id: 1 });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
