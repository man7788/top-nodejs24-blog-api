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
    expect(res.json).toHaveBeenCalledTimes(1);
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

  test('response post create result', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    const post = { id: 1 };

    db.createPost = jest.fn();
    db.createPost.mockReturnValue(post);

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = {
      user: { id: 1 },
      body: { title: 'Post title', content: 'Post content', published: true },
    };
    const res = mockResponse();

    // Second anonymous function of "postBlogPost" controller array
    await postController.postBlogPost[1](req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        post: { id: post.id },
      },
    });
  });
});

describe(`Get all posts controller`, () => {
  test('response with all posts', async () => {
    const posts = [
      {
        id: 1,
        authorId: 1,
        title: 'Post title 1',
        content: 'Post content 1',
        createdAt: new Date(),
        updateddAt: new Date(),
        published: false,
        comments: [],
      },
      {
        id: 2,
        authorId: 1,
        title: 'Post title 2',
        content: 'Post content 2',
        createdAt: new Date(),
        updateddAt: new Date(),
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
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        posts,
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
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        posts,
      },
    });
  });
});

describe(`Get single post controller`, () => {
  test('response with error if post not found', async () => {
    db.readPost = jest.fn();
    db.readPost.mockReturnValue(null);

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = { params: { postId: 1 } };
    const res = mockResponse();

    await postController.getPost(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 404,
        message: 'Not found',
      },
    });
  });

  test('response with a single post', async () => {
    const post = {
      id: 1,
      authorId: 1,
      title: 'Post title 1',
      content: 'Post content 1',
      createdAt: new Date(),
      updateddAt: new Date(),
      published: false,
      comments: [],
    };

    db.readPost = jest.fn();
    db.readPost.mockReturnValue(post);

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = { params: { postId: 1 } };
    const res = mockResponse();

    await postController.getPost(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        post,
      },
    });
  });
});

describe(`Patch a single post controller`, () => {
  test('response with error if post not found', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    db.readPost = jest.fn();
    db.readPost.mockReturnValue(null);

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = { params: { postId: 1 } };
    const res = mockResponse();

    // Second anonymous function of "patchPost" controller array
    await postController.patchPost[1](req, res);

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

  test('response with form validation error', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => false,
      array: () => [
        { path: 'title', msg: 'Title must not be empty.' },
        { path: 'content', msg: 'Content must not be empty.' },
        { path: 'published', msg: 'Published must be a boolean value.' },
      ],
    }));

    db.readPost = jest.fn();
    db.readPost.mockReturnValue({});

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const req = { params: { postId: 1 } };
    const res = mockResponse();

    // Second anonymous function of "patchPost" controller array
    await postController.patchPost[1](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 400,
        message: 'Post patch form validation failed.',
        details: [
          { field: 'title', message: 'Title must not be empty.' },
          { field: 'content', message: 'Content must not be empty.' },
          { field: 'published', message: 'Published must be a boolean value.' },
        ],
      },
    });
  });
});
