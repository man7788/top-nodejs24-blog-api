const { Router } = require('express');
const customJwtAuth = require('../middlewares/passport/customAuth');
const postController = require('../controllers/postController');

const postRouter = Router();

// POST request to create new post
postRouter.post('/', customJwtAuth, postController.postBlogPost);

// GET request to get all posts
postRouter.get('/', customJwtAuth, postController.getAllPosts);

// GET request to get a single post
postRouter.get('/:postId', customJwtAuth, postController.getPost);

// Patch request to update a single post
postRouter.patch('/:postId', customJwtAuth, postController.patchPost);

// Delete request to delete a single post
postRouter.delete('/:postId', customJwtAuth, postController.deletePost);

module.exports = postRouter;
