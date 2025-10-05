const notFound = require('../../../../src/middlewares/errors/routeNotFound');

beforeEach(async () => {
  res = {
    // Allow chaining of .status().json()
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
  req = {};
  next = jest.fn();
});

afterEach(async () => {
  jest.clearAllMocks();
});

describe('Route not found handler', () => {
  test('response with 404 status code and error message', async () => {
    notFound(req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: {
          code: 404,
          message: 'Page not found',
        },
      }),
    );
  });
});
