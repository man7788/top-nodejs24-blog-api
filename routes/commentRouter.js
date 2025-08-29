const { Router } = require('express');

const commentController = require('../controllers/commentController');

const commentRouter = Router();

// POST request to create comment
commentRouter.post('/:postId/comments', commentController.postComment);

module.exports = commentRouter;
