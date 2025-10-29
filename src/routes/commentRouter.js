const { Router } = require('express');
const customJwtAuth = require('../middlewares/passport/customAuth');
const commentController = require('../controllers/commentController');

const commentRouter = Router();

// POST request to create comment
commentRouter.post('/:postId/comments', commentController.postComment);

// GET request to read comment
commentRouter.get(
  '/:postId/comments/:commentId',
  customJwtAuth,
  commentController.getComment,
);

// UPDATE request to update comment
commentRouter.patch(
  '/:postId/comments/:commentId',
  customJwtAuth,
  commentController.patchComment,
);

// DELETE request to delete comment
commentRouter.delete(
  '/:postId/comments/:commentId',
  customJwtAuth,
  commentController.deleteComment,
);

module.exports = commentRouter;
