const { Router } = require('express');

const authController = require('../controllers/authController');

const authRouter = Router();

// POST request to authenticate and sign JWT
authRouter.post('/login', authController.postLogin);

module.exports = authRouter;
