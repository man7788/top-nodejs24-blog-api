const prisma = require('../../../src/config/prisma/client');
const commentRouter = require('../../../src/routes/commentRouter');

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/', commentRouter);

jest.mock('passport', () => ({
  use: jest.fn(),
  authenticate: jest.fn(() => (req, res, next) => {
    req.user = { id: '1' };
    next();
  }),
}));

afterEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
});

describe(`POST '/:postId/comments'`, () => {
  beforeEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1;`;
    await prisma.$queryRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1;`;
    await prisma.post.create({
      data: {
        authorId: 1,
        title: 'Title for the first post',
        content: 'Content for the first post.',
      },
    });
  });

  test('response with form validation error', async () => {
    const response = await request(app).post('/1/comments');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: expect.any(String),
        details: [
          { field: 'name', message: expect.any(String) },
          { field: 'email', message: expect.any(String) },
          { field: 'content', message: expect.any(String) },
        ],
      },
    });
  });

  test('response with comment create result', async () => {
    const payload = {
      name: 'foobar',
      email: 'foo@bar.com',
      content: 'Create new comment content',
    };

    const response = await request(app)
      .post('/1/comments')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        comment: { id: expect.any(Number), postId: expect.any(Number) },
      },
    });
  });
});

describe(`GET '/:postId/comments/:commentId'`, () => {
  beforeEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1;`;
    await prisma.$queryRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1;`;
    await prisma.post.create({
      data: {
        authorId: 1,
        title: 'Title for the first post',
        content: 'Content for the first post.',
        comments: {
          create: {
            name: 'foobar',
            email: 'foo@bar.com',
            content: 'Comment for the first post',
          },
        },
      },
    });
  });

  test('response with comment not found error', async () => {
    const response = await request(app).get('/1/comments/1001');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: expect.any(String),
      },
    });
  });

  test('response with a single comment', async () => {
    const response = await request(app).get('/1/comments/1');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        comment: {
          id: 1,
          name: expect.any(String),
          email: expect.any(String),
          content: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          published: true,
          postId: 1,
        },
      },
    });
  });
});

describe(`PATCH '/:postId/comments/:commentId'`, () => {
  beforeEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1;`;
    await prisma.$queryRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1;`;
    await prisma.post.create({
      data: {
        authorId: 1,
        title: 'Title for the first post',
        content: 'Content for the first post.',
        comments: {
          create: {
            name: 'foobar',
            email: 'foo@bar.com',
            content: 'Comment for the first post',
          },
        },
      },
    });
  });

  test('response with form validation error', async () => {
    const response = await request(app).patch('/1/comments/1');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: expect.any(String),
        details: [{ field: 'content', message: expect.any(String) }],
      },
    });
  });

  test('response with comment not found error', async () => {
    const payload = {
      content: 'Patch comment content',
    };

    const response = await request(app)
      .patch('/1/comments/1001')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: expect.any(String),
      },
    });
  });

  test('response with comment patch result', async () => {
    const payload = {
      content: 'Patch comment content',
    };

    const response = await request(app)
      .patch('/1/comments/1')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        comment: {
          id: 1,
          name: expect.any(String),
          email: expect.any(String),
          content: 'Patch comment content',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          published: true,
          postId: 1,
        },
      },
    });
  });
});

describe(`DELETE '/:postId/comments/:commentId'`, () => {
  beforeEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1;`;
    await prisma.$queryRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1;`;
    await prisma.post.create({
      data: {
        authorId: 1,
        title: 'Title for the first post',
        content: 'Content for the first post.',
        comments: {
          create: {
            name: 'foobar',
            email: 'foo@bar.com',
            content: 'Comment for the first post',
          },
        },
      },
    });
  });

  test('response with comment not found error', async () => {
    const payload = {
      content: 'Patch comment content',
    };

    const response = await request(app)
      .delete('/1/comments/1001')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: expect.any(String),
      },
    });
  });
});
