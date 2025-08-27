const { body } = require('express-validator');

const emptyErr = 'must not be empty.';
const lengthErr255 = 'must not must not exceed 255 characters.';
const lengthErr64 = 'must not must not exceed 255 characters.';
const formatErr = 'format is not correct.';

exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(`Email ${emptyErr}`)
    .bail()
    .isLength({ max: 255 })
    .withMessage(`Email ${lengthErr255}`)
    .bail()
    .isEmail()
    .withMessage(`Email ${formatErr}`)
    .escape(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage(`Password ${emptyErr}`)
    .bail()
    .isLength({ max: 64 })
    .withMessage(`Password ${lengthErr64}`)
    .escape(),
];
