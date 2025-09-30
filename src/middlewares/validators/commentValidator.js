const { body } = require('express-validator');

const emptyErr = 'must not be empty.';
const formatErr = 'format is not correct.';
const lengthErr255 = 'must not exceed 255 characters.';
const lengthErr5to255 = 'must between 5 to 255 characters.';

exports.validateComment = [
  body('name')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage(`Name ${lengthErr5to255}`)
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage(`Email ${emptyErr}`)
    .bail()
    .isEmail()
    .withMessage(`Email ${formatErr}`)
    .bail()
    .isLength({ max: 255 })
    .withMessage(`Email ${lengthErr255}`)
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

exports.patchComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage(`Content ${emptyErr}`)
    .bail()
    .isLength({ max: 255 })
    .withMessage(`Content ${lengthErr255}`)
    .escape(),
];
