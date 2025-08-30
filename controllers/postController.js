const validator = require('../utils/validators/postValidator');
const { validationResult } = require('express-validator');
const db = require('../prisma/queries/postQuery');

// Handle post create on POST
exports.postBlogPost = [
  validator.validatePost,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorArray = errors.array();
      const resMessage = [];

      errorArray.forEach((error) => {
        resMessage.push({ field: error.path, message: error.msg });
      });

      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Post create form validation failed.',
          details: resMessage,
        },
      });
    }

    const author = Number(req.user.id);
    const title = req.body.title;
    const content = req.body.content;
    const published = req.body.published;

    const post = await db.createPost(author, title, content, published);

    res.status(201).json({
      status: 'success',
      data: {
        post: { id: post.id },
      },
    });
  },
];

// Handle get all posts on GET
exports.getAllPosts = async (req, res) => {
  const posts = await db.readAllPosts();

  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
};

// Handle get a single post on GET
exports.getPost = async (req, res) => {
  const postId = req.params.postId;

  const post = await db.readPost(Number(postId));

  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
};

// Handle update a single post on PATCH
exports.patchPost = async (req, res) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  const isPublished = req.body.isPublished;

  const updated = await db.updatePost(
    Number(postId),
    title,
    content,
    isPublished
  );

  res.status(200).json({
    status: 'success',
    data: {
      post: updated,
    },
  });
};

// Handle delete a single post on DELETE
exports.deletePost = async (req, res) => {
  const postId = req.params.postId;

  const deleted = await db.deletePost(Number(postId));

  res.status(200).json({
    status: 'success',
    data: {
      post: { id: deleted.id },
    },
  });
};
