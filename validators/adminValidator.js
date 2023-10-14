const { body } = require('express-validator');
const Admin = require('../models/admin');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');

let adminValidators = [
    body('first_name').isAlpha().withMessage('Only alphabet is allowed').isLength({ min: 3, max: 20 }).withMessage('Surname must be between 3 and 20 characters').trim().escape(),
    body('last_name').isAlpha().withMessage('Only alphabet is allowed').isLength({ min: 3, max: 20 }).withMessage('Surname must be between 3 and 20 characters').trim().escape(),
    body('phone').isMobilePhone('en-NG').withMessage('Invalid phone number'),
    body('gender').matches(/(Male|Female)/).withMessage('Please pick a gender'),
    body('email').custom(async (value) => {
        let admin = await Admin.findByEmail(value);
        if (admin) {
            throw new Error('Email already exists');
        }
        return true;
    }
    ).isEmail().normalizeEmail(),
    body('phone').custom(async (value) => {
        let admin = await Admin.findByPhone(value);
        if (admin) {
            throw new Error('Phone number already exists');
        }
        return true;
    }
    ),
    checkForValidationErrors
];

module.exports = adminValidators;



