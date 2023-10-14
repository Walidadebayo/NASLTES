const { body } = require('express-validator');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');
const { verify } = require('password-hash');
const Admin = require('../models/admin');

const adminEmailValidator = [
    body('email').normalizeEmail(),
    body('email').custom(async(value, {req}) =>{
        let admin = await Admin.findByEmail(value)
        if (admin) {
            throw new Error('Email already exist')
        }
        return true;
    }),

    body('password').custom((value, {req}) => {
        let admin = req.session.admin
        if (admin) {
            if (verify(value, admin.password)) {
                return true;
            }
        }
        throw new Error('Invalid password');
    }),
    checkForValidationErrors
]
module.exports = adminEmailValidator