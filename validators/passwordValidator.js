const { body } = require('express-validator');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');
const { verify } = require('password-hash');

const passwordValidator = [
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    body('previous_password').custom(async(value, { req }) => {
        let admin = req.session.admin;
        if (admin) {
            if (verify(value, admin.password)) {
                return true;
            }
            }
        throw new Error('Invalid password');
    }),
    
    body('password').custom(async(value, { req }) => {
        let admin = req.session.admin;
        if (admin) {
            if (verify(value, admin.password)) {
                throw new Error('Cannot use previous password');
            }
            return true;
        }
    }).isLength({min: 8}).withMessage('Password must be at least 8 characters long'),

    checkForValidationErrors
]
module.exports = passwordValidator