const db = require('../database/queries/commentQuery');

// Handle comment create on POST
exports.postComment = async (req, res) => {
  const postId = req.params.postId;
  const name = req.body.name;
  const email = req.body.email;
  const content = req.body.content;

  const comment = await db.createComment(Number(postId), name, email, content);

  res.status(200).json({
    status: 'success',
    data: {
      comment: { id: comment.id, post_id: comment.post_id },
    },
  });
};
