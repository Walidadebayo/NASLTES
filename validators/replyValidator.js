const { body } = require('express-validator');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');

let replyValidators = [
    body('subject').notEmpty().withMessage('Please enter the reason for the message').isLength({ min: 3}).withMessage('Subject must be at least 3 characters').trim().escape(),
    body('message').notEmpty().withMessage('Please enter the message').isLength({ min: 5}).withMessage('Message must be at least 5 characters').trim().escape(),
    checkForValidationErrors
];

module.exports = replyValidators;



