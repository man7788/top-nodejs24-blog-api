const commentController = require('../../../src/controllers/commentController');
const { validationResult } = require('express-validator');

// To mock a named export, use the factory function pattern in jest.mock()
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('../../../src/middlewares/validators/commentValidator', () => ({
  validatePost: jest.fn(),
}));

afterEach(async () => {
  jest.clearAllMocks();
});

describe(`Post comment controller`, () => {
  test('response with form validation error', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => false,
      array: () => [
        { path: 'name', msg: 'Name must not be empty.' },
        { path: 'email', msg: 'Email must not be empty.' },
        { path: 'content', msg: 'Content must not be empty.' },
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
    await commentController.postComment[1](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 400,
        message: 'Comment form validation failed.',
        details: [
          { field: 'name', message: 'Name must not be empty.' },
          { field: 'email', message: 'Email must not be empty.' },
          { field: 'content', message: 'Content must not be empty.' },
        ],
      },
    });
  });
});
