const { Router } = require('express');
const { postAdmin, deleteAdmin, profile, editAdmin, updateAdmin, editEmail, updateEmail, editPassword, updatePassword } = require('../controllers/adminController');
const Admin = require('../models/admin');
const Student = require('../models/students');
const adminValidators = require('../validators/adminValidator');
const editAdminValidators = require("../validators/editAdminValidator");
const adminEmailValidator = require('../validators/adminEmailValidator');
const passwordValidator = require('../validators/passwordValidator');
const router = Router()

router.get('/admins/', async (req, res) => {
    let admins = await Admin.fetch()
    let logAdmin = await Admin.findById(req?.session?.admin?.id)
    res.render('admins', { admins, logAdmin })
})

router.post("/add-admin", adminValidators, postAdmin);
router.get("/delete-admin/:admin_id", deleteAdmin);
router.get("/profile/", profile);
router.get("/edit-profile/", editAdmin);
router.post("/edit-profile/", editAdminValidators,updateAdmin);
router.get("/changeEmail/", editEmail);
router.post("/changeEmail/", adminEmailValidator, updateEmail);
router.get("/changePassword/", editPassword);
router.post("/changePassword/", passwordValidator, updatePassword);


router.get('/students', async (req, res) => {
    let students = await Student.fetch()
    for (const student of students) {
        student.table = await Table.findById(student.table_id)
        student.ticket = await Ticket.findById(student.ticket_id)
        console.log(student.table, student.ticket);
    }
    res.render('students', { students })
})


router.get('/logout', async (req, res) => {
    delete req.session.admin
    res.redirect('/admin/login')
})

module.exports = router