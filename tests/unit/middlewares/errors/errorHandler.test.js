const errorHandler = require('../../../../src/middlewares/errors/errorHandler');

jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Non-production environment', () => {
  test('response with non 500 status code and error message', async () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const err = { statusCode: 401, message: 'Error message' };
    const req = {};
    const next = jest.fn();
    const res = mockResponse();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 401,
          message: 'Error message',
        }),
      }),
    );
  });

  test('response with non 500 status code and fallback error message', async () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const err = { statusCode: 401 };
    const req = {};
    const next = jest.fn();
    const res = mockResponse();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 401,
          message: 'Client Error',
        }),
      }),
    );
  });

  test('response with fallback 500 status code and error message', async () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const err = { message: 'Error message' };
    const req = {};
    const next = jest.fn();
    const res = mockResponse();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 500,
          message: 'Error message',
        }),
      }),
    );
  });

  test('response with fallback 500 status code and fallback error message', async () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const err = {};
    const req = {};
    const next = jest.fn();
    const res = mockResponse();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 500,
          message: 'Internal Server Error',
        }),
      }),
    );
  });
});

describe('Production environment', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'production';
  });

  test('response with non 500 status code and error message', async () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const err = { statusCode: 401, message: 'Error message' };
    const req = {};
    const next = jest.fn();
    const res = mockResponse();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 401,
          message: 'Error message',
        }),
      }),
    );
  });

  test('response with non 500 status code and fallback error message', async () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const err = { statusCode: 401 };
    const req = {};
    const next = jest.fn();
    const res = mockResponse();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 401,
          message: 'Client Error',
        }),
      }),
    );
  });

  test('response with fallback 500 status code and generic message', async () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const err = { message: 'Error message' };
    const req = {};
    const next = jest.fn();
    const res = mockResponse();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 500,
          message: 'Internal server error. Something went wrong at our end.',
        }),
      }),
    );
  });

  test('response with 500 status code and generic message', async () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const err = { statudCode: 500, message: 'Error message' };
    const req = {};
    const next = jest.fn();
    const res = mockResponse();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: 500,
          message: 'Internal server error. Something went wrong at our end.',
        }),
      }),
    );
  });
});
