const { body } = require('express-validator');
const Admin = require('../models/admin');
const checkForValidationErrors = require('../middlewares/checkForValidationErrors');

let eventValidators = [
    body('name').notEmpty().withMessage('Please enter event name'),
    body('performance').notEmpty().withMessage('Please enter price'),
    body('date').notEmpty().withMessage('Please enter date and time'),
    body('venue').notEmpty().withMessage('Please enter venue'),
    checkForValidationErrors
];

module.exports = eventValidators;



