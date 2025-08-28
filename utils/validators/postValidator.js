const { body } = require('express-validator');

const emptyErr = 'must not be empty.';
const lengthErr24 = 'must not exceed 255 characters.';
const lengthErr255 = 'must not exceed 255 characters.';

exports.validatePost = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(`Title ${emptyErr}`)
    .bail()
    .isLength({ max: 24 })
    .withMessage(`Title ${lengthErr24}`)
    .escape(),
  body('content')
    .trim()
    .notEmpty()
    .withMessage(`Content ${emptyErr}`)
    .bail()
    .isLength({ max: 255 })
    .withMessage(`Content ${lengthErr255}`)
    .escape(),
];
