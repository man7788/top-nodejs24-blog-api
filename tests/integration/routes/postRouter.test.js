const prisma = require('../../../src/config/prisma/client');
const postRouter = require('../../../src/routes/postRouter');

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/', postRouter);

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
  await prisma.post.deleteMany();
});

describe(`POST '/'`, () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
    await prisma.$queryRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1;`;
  });

  test('response form validation error', async () => {
    const response = await request(app).post('/');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body.status).toMatch(/error/i);
    expect(response.body.error.code).toEqual(400);
    expect(response.body.error.message).toEqual(expect.any(String));

    const error = { field: expect.any(String), message: expect.any(String) };

    expect(response.body.error.details).toHaveLength(2);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([error, error]),
    );
  });

  test('response post create result', async () => {
    const payload = {
      user: 1,
      title: 'Create new post',
      content: 'Create new post content',
    };

    const response = await request(app)
      .post('/')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body.status).toMatch(/success/i);
    expect(response.body.data.post.id).toEqual(1);
  });
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

describe(`PATCH '/:postId'`, () => {
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
      ],
    });
  });

  test('response with error if post not found', async () => {
    const response = await request(app).patch('/1001');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(404);
    expect(response.body.status).toMatch(/error/i);
    expect(response.body.error.code).toEqual(404);
    expect(response.body.error.message).toMatch(/not found/i);
  });

  test('response form validation error', async () => {
    const payload = {
      published: 'not boolean value',
    };

    const response = await request(app)
      .patch('/1')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body.status).toMatch(/error/i);
    expect(response.body.error.code).toEqual(400);
    expect(response.body.error.message).toEqual(expect.any(String));

    const error = { field: expect.any(String), message: expect.any(String) };

    expect(response.body.error.details).toHaveLength(3);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([error, error, error]),
    );
  });

  test('response post patch result', async () => {
    const payload = {
      title: 'Patch post title',
      content: 'Patch post content',
      published: true,
    };

    const response = await request(app)
      .patch('/1')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.status).toMatch(/success/i);

    // Check all the static properties
    expect(response.body.data.post).toMatchObject({
      id: 1,
      authorId: expect.any(Number),
      title: 'Patch post title',
      content: 'Patch post content',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      published: true,
    });
  });
});
