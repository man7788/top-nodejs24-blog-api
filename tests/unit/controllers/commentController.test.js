const commentController = require('../../../src/controllers/commentController');
const { validationResult } = require('express-validator');
const db = require('../../../src/services/queries/commentQuery');

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

    // Second anonymous function of "postComment" controller array
    await commentController.postComment[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
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

  test('response comment create result', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    const comment = { id: 1, postId: 1 };

    db.createComment = jest.fn();
    db.createComment.mockReturnValue(comment);

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = {
      params: { postId: 1 },
      body: { name: 'foobar', email: 'foo@bar.com', content: 'Post content' },
    };
    const res = mockResponse();

    // Second anonymous function of "postComment" controller array
    await commentController.postComment[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        comment: { id: comment.id, postId: comment.postId },
      },
    });
  });
});

describe(`Get comment controller`, () => {
  test('response with error if comment not found', async () => {
    db.readComment = jest.fn();
    db.readComment.mockReturnValue(null);

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = { params: { postId: 1, commentId: 1 } };
    const res = mockResponse();

    await commentController.getComment(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 404,
        message: 'Not found',
      },
    });
  });

  test('response with a single comment', async () => {
    const comment = {
      id: 1,
      name: 'foobar',
      email: 'foo@bar.com',
      content: 'Post comment',
      postId: 1,
    };

    db.readComment = jest.fn();
    db.readComment.mockReturnValue(comment);

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = { params: { postId: 1, commentId: 1 } };
    const res = mockResponse();

    await commentController.getComment(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        comment,
      },
    });
  });
});

describe(`Patch comment controller`, () => {
  test('response with form validation error', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => false,
      array: () => [{ path: 'content', msg: 'Content must not be empty.' }],
    }));

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = {};
    const res = mockResponse();

    // Second anonymous function of "patchComment" controller array
    await commentController.patchComment[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 400,
        message: 'Patch comment form validation failed.',
        details: [{ field: 'content', message: 'Content must not be empty.' }],
      },
    });
  });
});
