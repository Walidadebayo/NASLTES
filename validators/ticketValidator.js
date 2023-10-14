const { body } = require('express-validator');
const Admin = require('../models/admin');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');

let ticketValidators = [
    body('name').notEmpty().withMessage('Please enter ticket name'),
    checkForValidationErrors
];

module.exports = ticketValidators;



