const { body } = require('express-validator');
const Admin = require('../models/admin');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');

let tableValidators = [
    body('name').notEmpty().withMessage('Please enter table name'),
    body('price').notEmpty().withMessage('Please enter price'),
    checkForValidationErrors
];

module.exports = tableValidators;



