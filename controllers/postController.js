const validator = require('../utils/validators/postValidator');
const { validationResult } = require('express-validator');
const db = require('../database/queries/postQuery');

exports.postBlogPost = [
  validator.validatePost,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorArray = errors.array();
      const resMessage = [];

      errorArray.forEach((error) => {
        resMessage.push({ path: error.path, message: error.msg });
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          messages: resMessage,
        },
      });
    }

    const author = req.user.username;
    const title = req.body.title;
    const content = req.body.content;
    const isPublished = req.body.isPublished;

    const post = await db.createPost(author, title, content, isPublished);

    res.status(201).json({
      success: true,
      payload: {
        post_id: post.id,
      },
      status: 201,
    });
  },
];

exports.getAllPosts = async (req, res) => {
  const posts = await db.readAllPosts();

  res.status(200).json({
    success: true,
    payload: {
      posts,
    },
    status: 200,
  });
};

exports.getPost = async (req, res) => {
  const postId = req.params.postId;

  const post = await db.readPost(Number(postId));

  res.status(200).json({
    success: true,
    payload: {
      post,
    },
    status: 200,
  });
};

exports.patchPost = async (req, res) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  const updated = await db.updatePost(Number(postId), title, content);

  res.status(200).json({
    success: true,
    payload: {
      updated,
    },
    status: 200,
  });
};

exports.deletePost = async (req, res) => {
  const postId = req.params.postId;

  const deleted = await db.deletePost(Number(postId));

  res.status(200).json({
    success: true,
    payload: {
      deleted_id: deleted.id,
    },
    status: 200,
  });
};
