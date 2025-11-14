const { Router } = require('express');
const customJwtAuth = require('../middlewares/passport/customAuth');
const authController = require('../controllers/authController');

const authRouter = Router();

// POST request to authenticate and sign JWT
authRouter.post('/login', authController.postLogin);

// GET request to vertify JWT
authRouter.get('/auth', customJwtAuth, authController.getAuth);

// PATCH request to update user profile
authRouter.patch('/profile', customJwtAuth, authController.patchProfile);

// PATCH request to update user password
authRouter.patch('/password', customJwtAuth, authController.patchPassword);

module.exports = authRouter;
