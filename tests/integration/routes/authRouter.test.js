const authRouter = require('../../../src/routes/authRouter');

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/', authRouter);

describe(`POST '/login'`, () => {
  test('response form validation error', async () => {
    const response = await request(app).post('/login');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body).toMatchObject({
      status: 'error',
      error: {
        code: 400,
        message: expect.any(String),
        details: [
          expect.objectContaining({
            field: 'email',
            message: expect.any(String),
          }),
          expect.objectContaining({
            field: 'password',
            message: expect.any(String),
          }),
        ],
      },
    });
  });
});
