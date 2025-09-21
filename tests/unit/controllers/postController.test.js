const postController = require('../../../src/controllers/postController');
const { validationResult } = require('express-validator');
const db = require('../../../src/services/queries/postQuery');

// To mock a named export, use the factory function pattern in jest.mock()
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('../../../src/middlewares/validators/postValidator', () => ({
  validatePost: jest.fn(),
}));

afterEach(async () => {
  jest.clearAllMocks();
});

describe(`Post blog post controller`, () => {
  test('response with form validation error', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => false,
      array: () => [
        { path: 'title', msg: 'Title must not be empty.' },
        { path: 'content', msg: 'Content must not be empty.' },
      ],
    }));

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = { user: { id: 1 } };
    const res = mockResponse();

    // Second anonymous function of "postBlogPost" controller array
    await postController.postBlogPost[1](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 400,
        message: 'Post create form validation failed.',
        details: [
          { field: 'title', message: 'Title must not be empty.' },
          { field: 'content', message: 'Content must not be empty.' },
        ],
      },
    });
  });
});

describe(`Get all posts controller`, () => {
  test('response with all posts', async () => {
    const createdAt = new Date();
    const updateddAt = createdAt;

    const posts = [
      {
        id: 1,
        authorId: 1,
        title: 'Post title 1',
        content: 'Post content 1',
        createdAt,
        updateddAt,
        published: false,
        comments: [],
      },
      {
        id: 2,
        authorId: 1,
        title: 'Post title 2',
        content: 'Post content 2',
        createdAt,
        updateddAt,
        published: true,
        comments: [],
      },
    ];

    db.readAllPosts = jest.fn();
    db.readAllPosts.mockReturnValue(posts);

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = {};
    const res = mockResponse();

    await postController.getAllPosts(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        posts: [
          {
            id: 1,
            authorId: 1,
            title: 'Post title 1',
            content: 'Post content 1',
            createdAt,
            updateddAt,
            published: false,
            comments: [],
          },
          {
            id: 2,
            authorId: 1,
            title: 'Post title 2',
            content: 'Post content 2',
            createdAt,
            updateddAt,
            published: true,
            comments: [],
          },
        ],
      },
    });
  });

  test('response with empty array if no post found', async () => {
    const posts = [];

    db.readAllPosts = jest.fn();
    db.readAllPosts.mockReturnValue(posts);

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = {};
    const res = mockResponse();

    await postController.getAllPosts(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        posts: [],
      },
    });
  });
});
