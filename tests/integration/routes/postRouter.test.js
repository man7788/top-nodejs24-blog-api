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

afterEach(async () => {
  await prisma.post.deleteMany();
  jest.clearAllMocks();
});

describe(`post router GET '/'`, () => {
  test('response with all posts', async () => {
    const response = await request(app).get('/');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.status).toMatch(/success/);
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
});
