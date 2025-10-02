const notFound = require('../../../../src/middlewares/errors/routeNotFound');

describe('Route not found handler', () => {
  test('response with 400 status code and error message', async () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = {};
    const res = mockResponse();
    const next = jest.fn();

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
