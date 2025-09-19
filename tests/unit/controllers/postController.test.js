const postRouter = require('../../../src/controllers/postController');
const db = require('../../../src/services/queries/postQuery');

afterEach(async () => {
  jest.clearAllMocks();
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

    await postRouter.getAllPosts(req, res);

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
});
