const { body } = require('express-validator');
const Admin = require('../models/admin');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');

let bookTicketValidators = [
    body('full_name').notEmpty().withMessage('Please enter your name'),
    body('client_email').notEmpty().withMessage('Please enter email address'),
    body('table_id').custom(async (value)=>{
        if (value === 'select') {
            throw new Error('Please pick table');
        }
        return true;
    }),
    checkForValidationErrors
];

module.exports = bookTicketValidators;



