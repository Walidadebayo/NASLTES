const { body } = require('express-validator');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');
const { verify } = require('password-hash');

const set_passwordValidator = [
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long'),

    checkForValidationErrors
]
module.exports = set_passwordValidator