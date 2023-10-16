const { body } = require('express-validator');
const Admin = require('../models/admin');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');

let bookTicketValidators = [
    body('full_name').notEmpty().withMessage('Please enter your name').trim(),
    body('student_email').notEmpty().withMessage('Please enter email address').isEmail().withMessage('Please enter valid email address').trim(),
    body('phone').notEmpty().withMessage('Please enter phone number').isMobilePhone('en-NG').withMessage('Please enter valid phone number').trim(),
    body('type').custom((value)=>{
        if(!['regular'].includes(value)){
            throw new Error('Please select ticket type')
        }
        return true
    }),
    checkForValidationErrors
];

module.exports = bookTicketValidators;



