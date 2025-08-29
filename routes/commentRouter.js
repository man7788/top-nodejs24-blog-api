const { Router } = require('express');

const commentController = require('../controllers/commentController');

const commentRouter = Router();

// POST request to create comment
commentRouter.post('/:postId/comments', commentController.postComment);

// UPDATE request to update comment
commentRouter.patch(
  '/:postId/comments/:commentId',
  commentController.patchComment
);

// DELETE request to delete comment
commentRouter.delete(
  '/:postId/comments/:commentId',
  commentController.deleteComment
);

module.exports = commentRouter;
