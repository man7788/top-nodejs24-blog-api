const { Router } = require('express');
const passport = require('passport');

const postController = require('../controllers/postController');

const postRouter = Router();

// POST request to create new post
postRouter.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  postController.postBlogPost
);

// GET request to get all posts
postRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  postController.getAllPosts
);

// GET request to get a single post
postRouter.get(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  postController.getPost
);

// Patch request to update a single post
postRouter.patch(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  postController.patchPost
);

// Delete request to delete a single post
postRouter.delete(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  postController.deletePost
);

module.exports = postRouter;
