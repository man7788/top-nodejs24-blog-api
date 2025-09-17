const prisma = require('../../../src/config/prisma/client');
const postRouter = require('../../../src/routes/postRouter');

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/', postRouter);

jest.mock('passport', () => ({
  use: jest.fn(),
  authenticate: jest.fn(() => (req, res, next) => {
    req.user = { id: 'mockUserId' };
    next();
  }),
}));

afterEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await prisma.post.deleteMany();
});

describe(`GET '/'`, () => {
  beforeAll(async () => {
    await prisma.post.deleteMany();
    await prisma.post.createMany({
      data: [
        {
          authorId: 1,
          title: 'Title for the first post',
          content: 'Content for the first post.',
        },
        {
          authorId: 1,
          title: 'Title for the second post',
          content: 'Content for the second post.',
        },
      ],
    });
  });

  test('response with all posts', async () => {
    const response = await request(app).get('/');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.status).toMatch(/success/i);
    expect(response.body.data.posts).toHaveLength(2);

    // Check all the static properties
    expect(response.body.data.posts[0]).toMatchObject({
      id: expect.any(Number),
      authorId: expect.any(Number),
      content: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      published: expect.any(Boolean),
    });
  });

  test('response with empty array if no post is found', async () => {
    await prisma.post.deleteMany();

    const response = await request(app).get('/');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.status).toMatch(/success/i);
    expect(response.body.data.posts).toHaveLength(0);
    expect(response.body.data.posts).toEqual([]);
  });
});

describe(`GET '/:postId'`, () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1;`;
    await prisma.post.createMany({
      data: [
        {
          authorId: 1,
          title: 'Title for the first post',
          content: 'Content for the first post.',
        },
        {
          authorId: 1,
          title: 'Title for the second post',
          content: 'Content for the second post.',
        },
      ],
    });
  });

  test('response with error if post not found', async () => {
    await prisma.post.deleteMany();

    const response = await request(app).get('/1001');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(404);
    expect(response.body.status).toMatch(/error/i);
    expect(response.body.error.code).toEqual(404);
    expect(response.body.error.message).toMatch(/not found/i);
  });

  test('response with a single post', async () => {
    const postId = 1;

    const response = await request(app).get(`/${postId}`);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.status).toMatch(/success/i);

    // Check all the static properties
    expect(response.body.data.post).toMatchObject({
      id: postId,
      authorId: expect.any(Number),
      content: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      published: expect.any(Boolean),
      comments: expect.any(Array),
    });
  });
});
