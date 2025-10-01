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
    await prisma.post.createMany({
      data: [
        {
          authorId: 1,
          title: 'Title for the first post',
          content: 'Content for the first post.',
        },
      ],
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
