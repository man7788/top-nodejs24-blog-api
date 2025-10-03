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

jest.mock('../../../src/services/queries/commentQuery', () => ({
  createComment: jest.fn(),
  readComment: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
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

    const req = {};

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

    db.createComment.mockReturnValue(comment);

    const req = {
      params: { postId: 1 },
      body: { name: 'foobar', email: 'foo@bar.com', content: 'Post content' },
    };

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
    db.readComment.mockReturnValue(null);

    const req = { params: { postId: 1, commentId: 1 } };

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

    db.readComment.mockReturnValue(comment);

    const req = { params: { postId: 1, commentId: 1 } };

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

    const req = {};

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

  test('response with comment not found error', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    db.readComment.mockReturnValue(null);

    const req = { params: { commentId: 1, postId: 1 } };

    // Second anonymous function of "patchComment" controller array
    await commentController.patchComment[1](req, res);

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

  test('response with patch comment result', async () => {
    const createdAt = new Date();
    const futureDate = Date.now() + 1 * 60 * 60 * 1000; // Add 1 hour (in milliseconds)
    const updatedAt = new Date(futureDate);

    const comment = {
      id: 1,
      name: 'foobar',
      email: 'foo@bar.com',
      content: 'Post comment',
      createdAt,
      updatedAt: createdAt,
      published: true,
      postId: 1,
    };

    db.readComment.mockReturnValue(comment);

    const req = {
      params: { commentId: 1, postId: 1 },
      body: { content: 'Updated comment' },
    };

    const updatedComment = {
      id: comment.id,
      name: comment.name,
      email: comment.email,
      content: req.body.content,
      createdAt,
      updatedAt,
      published: comment.published,
      postId: comment.postId,
    };

    db.updateComment.mockReturnValue(updatedComment);

    // Second anonymous function of "patchComment" controller array
    await commentController.patchComment[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        comment: updatedComment,
      },
    });
  });
});

describe(`Delete comment controller`, () => {
  test('response with comment not found error', async () => {
    db.readComment.mockReturnValue(null);

    const req = { params: { commentId: 1, postId: 1 } };

    await commentController.deleteComment(req, res);

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

  test('response with a deleted comment', async () => {
    const comment = {
      id: 1,
      name: 'foobar',
      email: 'foo@bar.com',
      content: 'Post comment',
      postId: 1,
    };

    db.readComment.mockReturnValue(comment);
    db.deleteComment.mockReturnValue(comment);

    const req = { params: { postId: 1, commentId: 1 } };

    await commentController.deleteComment(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        comment: { id: comment.id, postId: comment.postId },
      },
    });
  });
});
