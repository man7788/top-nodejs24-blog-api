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

jest.mock('../../../src/services/queries/postQuery', () => ({
  createPost: jest.fn(),
  readAllPosts: jest.fn(),
  readPost: jest.fn(),
  deletePost: jest.fn(),
  updatePost: jest.fn(),
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

describe(`Post blog post controller`, () => {
  test('response with form validation error', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => false,
      array: () => [
        { path: 'title', msg: 'Title must not be empty.' },
        { path: 'content', msg: 'Content must not be empty.' },
      ],
    }));

    const req = { user: { id: 1 } };

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

    db.createPost.mockReturnValue(post);

    const req = {
      user: { id: 1 },
      body: { title: 'Post title', content: 'Post content', published: true },
    };

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

    db.readAllPosts.mockReturnValue(posts);

    const req = {};

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

    db.readAllPosts.mockReturnValue(posts);

    const req = {};

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
    db.readPost.mockReturnValue(null);

    const req = { params: { postId: 1 } };

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

    db.readPost.mockReturnValue(post);

    const req = { params: { postId: 1 } };

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

    db.readPost.mockReturnValue(null);

    const req = { params: { postId: 1 } };

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

    db.readPost.mockReturnValue({});

    const req = { params: { postId: 1 } };

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

  test('response with post patch result', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    const createdAt = new Date();
    const post = {
      id: 1,
      authorId: 1,
      title: 'Post title 1',
      content: 'Post content 1',
      createdAt,
      updatedAt: createdAt,
      published: false,
      comments: [],
    };

    db.readPost.mockReturnValue(post);

    const req = {
      params: { postId: 1 },
      body: {
        title: 'Updated post 1 title',
        content: 'Updated post 1 content',
        published: true,
      },
    };

    const futureDate = Date.now() + 1 * 60 * 60 * 1000; // Add 1 hour (in milliseconds)
    const updatedAt = new Date(futureDate);

    const updatedPost = {
      id: post.id,
      authorId: post.authorId,
      title: req.body.title,
      content: req.body.content,
      createdAt,
      updatedAt,
      published: true,
    };

    db.updatePost.mockReturnValue(updatedPost);

    // Second anonymous function of "patchPost" controller array
    await postController.patchPost[1](req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        post: updatedPost,
      },
    });
  });
});

describe(`Delete a single post controller`, () => {
  test('response with error if post not found', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    db.readPost.mockReturnValue(null);

    const req = { params: { postId: 1 } };

    // Second anonymous function of "deletePost" controller array
    await postController.deletePost(req, res);

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

  test('response with post delete result', async () => {
    validationResult.mockImplementation(() => ({
      isEmpty: () => true,
    }));

    const createdAt = new Date();
    const post = {
      id: 1,
      authorId: 1,
      title: 'Post title 1',
      content: 'Post content 1',
      createdAt,
      updatedAt: createdAt,
      published: false,
      comments: [],
    };

    db.readPost.mockReturnValue(post);
    db.deletePost.mockReturnValue(post);

    const req = { params: { postId: 1 } };

    // Second anonymous function of "deletePost" controller array
    await postController.deletePost(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        post: { id: post.id },
      },
    });
  });
});
