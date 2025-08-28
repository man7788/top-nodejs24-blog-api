const { Router } = require('express');
const passport = require('passport');

const postController = require('../controllers/postController');

const postRouter = Router();

postRouter.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  postController.postBlogPost
);

postRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  postController.getAllPosts
);

postRouter.get(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  postController.getPost
);

module.exports = postRouter;
