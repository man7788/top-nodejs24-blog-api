const db = require('../database/queries/postQuery');

exports.postBlogPost = async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;

  const post = await db.createPost(title, content);

  res.status(201).json({
    success: true,
    payload: {
      post: post.id,
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
