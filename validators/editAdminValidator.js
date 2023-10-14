const { body } = require('express-validator');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');
const Admin = require('../models/admin');

let editAdminValidators = [
    body('first_name').notEmpty().withMessage('Please enter your first name').isAlpha().withMessage('Only alphabet is allowed').isLength({ min: 3, max: 20 }).withMessage('First name must be between 3 and 20 characters').trim().escape(),
    body('last_name').notEmpty().withMessage('Please enter your last name').isAlpha().withMessage('Only alphabet is allowed').isLength({ min: 3, max: 20 }).withMessage('Other name must be between 3 and 20 characters').trim().escape(),
    body('phone').notEmpty().withMessage('Please enter your phone number').isMobilePhone('en-NG').withMessage('Invalid phone number'),

    body('phone').custom(async(value, {req}) => {
        let adminSession = req.session.admin
        if (value === adminSession.phone) {
            return true
        }else{
        let admin = await Admin.findByPhone(value)
        if (admin) {
            throw new Error('Phone Number already exists')
        } else{
            return true;
        }
    }
    }),
    checkForValidationErrors
]
module.exports = editAdminValidators