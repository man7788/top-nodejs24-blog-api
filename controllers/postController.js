const db = require('../database/queries/postQuery');

exports.postBlogPost = async (req, res) => {
  const author = req.user.username;
  const title = req.body.title;
  const content = req.body.content;

  const post = await db.createPost(author, title, content);

  res.status(201).json({
    success: true,
    payload: {
      post_id: post.id,
    },
    status: 201,
  });
};

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
