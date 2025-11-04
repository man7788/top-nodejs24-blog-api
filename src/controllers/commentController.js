const validator = require('../middlewares/validators/commentValidator');
const { validationResult } = require('express-validator');
const ErrorFormatter = require('../utils/formatters/errorFormatter');
const db = require('../services/queries/commentQuery');

// Handle comment create on POST
exports.postComment = [
  validator.validateComment,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const details = new ErrorFormatter(errors).array();

      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Comment form validation failed.',
          details,
        },
      });
    }

    const postId = Number(req.params.postId);
    const name = req.body.name;
    const email = req.body.email;
    const content = req.body.content;

    const comment = await db.createComment(postId, name, email, content);

    if (comment === null) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 404,
          message: 'Not found',
        },
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        comment: { id: comment.id, postId: comment.postId },
      },
    });
  },
];

// Handle all comments read on GET
exports.getAllComments = async (req, res) => {
  const postId = req.params.postId;

  const comments = await db.readAllComments(Number(postId));

  if (comments === null) {
    return res.status(404).json({
      status: 'error',
      error: {
        code: 404,
        message: 'Not found',
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      comments,
    },
  });
};

// Handle a single comment read on GET
exports.getComment = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  const comment = await db.readComment(Number(postId), Number(commentId));

  if (comment === null) {
    return res.status(404).json({
      status: 'error',
      error: {
        code: 404,
        message: 'Not found',
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
};

// Handle comment update on UPDATE
exports.patchComment = [
  validator.patchComment,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const details = new ErrorFormatter(errors).array();

      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Patch comment form validation failed.',
          details,
        },
      });
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;

    const comment = await db.readComment(Number(postId), Number(commentId));

    if (comment === null) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 404,
          message: 'Not found',
        },
      });
    }

    const content = req.body.content;
    const updated = await db.updateComment(comment.postId, comment.id, content);

    res.status(200).json({
      status: 'success',
      data: {
        comment: updated,
      },
    });
  },
];

// Handle comment delete on DELETE
exports.deleteComment = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  const comment = await db.readComment(Number(postId), Number(commentId));

  if (comment === null) {
    return res.status(404).json({
      status: 'error',
      error: {
        code: 404,
        message: 'Not found',
      },
    });
  }

  const deleted = await db.deleteComment(comment.postId, comment.id);

  res.status(200).json({
    status: 'success',
    data: {
      comment: { id: deleted.id, postId: deleted.postId },
    },
  });
};
