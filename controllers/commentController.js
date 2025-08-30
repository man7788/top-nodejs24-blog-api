const validator = require('../utils/validators/commentValidator');
const { validationResult } = require('express-validator');
const db = require('../prisma/queries/commentQuery');

// Handle comment create on POST
exports.postComment = [
  validator.validateComment,
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
          message: 'Comment form validation failed.',
          details: resMessage,
        },
      });
    }

    const postId = Number(req.params.postId);
    const name = req.body.name;
    const email = req.body.email;
    const content = req.body.content;

    const comment = await db.createComment(postId, name, email, content);

    res.status(200).json({
      status: 'success',
      data: {
        comment: { id: comment.id, post_id: comment.post_id },
      },
    });
  },
];

// Handle comment read on GET
exports.getComment = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  const comment = await db.readComment(Number(postId), Number(commentId));

  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
};

// Handle comment update on UPDATE
exports.patchComment = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const content = req.body.content;

  const updated = await db.updateComment(
    Number(postId),
    Number(commentId),
    content
  );

  res.status(200).json({
    status: 'success',
    data: {
      comment: { id: updated.id },
    },
  });
};

// Handle comment delete on DELETE
exports.deleteComment = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  const deleted = await db.deleteComment(Number(postId), Number(commentId));

  res.status(200).json({
    status: 'success',
    data: {
      comment: { id: deleted.id },
    },
  });
};
