const { body } = require('express-validator');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');

let contactValidators = [
    body('name').notEmpty().withMessage('Please enter your name').isLength({ min: 7, max: 25 }).withMessage('Name must be between 7 and 20 characters').trim().escape(),
    body('email').notEmpty().withMessage('Please enter your email address').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('subject').notEmpty().withMessage('Please enter the reason for contacting us').isLength({ min: 3}).withMessage('Subject must be between 3 characters').trim().escape(),
    body('message').notEmpty().withMessage('Please enter the message you have for us').isLength({ min: 5}).withMessage('Message must be between 5 characters').trim().escape(),
    checkForValidationErrors
];

module.exports = contactValidators;



