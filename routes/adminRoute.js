const { Router } = require('express');
const { postAdmin, deleteAdmin, tickets, addTicket, addTable, updateImage, addImage, addEvent, deleteTicket, deleteTable, updateTicket, editTicket, editTable, updateTable, editEvent, updateEvent, profile, editAdmin, updateAdmin, editEmail, updateEmail, editPassword, updatePassword } = require('../controllers/adminController');
const Admin = require('../models/admin');
const Client = require('../models/clients');
const Gallery = require('../models/galleries');
const Contact = require('../models/contact');
const Table = require('../models/tables');
const Event = require('../models/events');
const Ticket = require('../models/tickets');
const adminValidators = require('../validators/adminValidator');
const tableValidators = require('../validators/tableValidator');
const ticketValidators = require('../validators/ticketValidator');
const eventValidators = require('../validators/eventValidator');
const replyValidators = require('../validators/replyValidator');
const replyEmail = require('../models/replyMessageEmail');
const editAdminValidators = require("../validators/editAdminValidator");
const adminEmailValidator = require('../validators/adminEmailValidator');
const passwordValidator = require('../validators/passwordValidator');
const router = Router()

router.get('/admins/', async (req, res) => {
    let admins = await Admin.fetch()
    let logAdmin = await Admin.findById(req?.session?.admin?.id)
    res.render('admins', { admins, logAdmin })
})
router.get('/event/', async (req, res) => {
    let events = await Event.fetch()
    res.render('events', { events })
})
router.post('/add-event/', eventValidators, addEvent)

router.post("/add-admin", adminValidators, postAdmin);
router.get("/delete-admin/:admin_id", deleteAdmin);
router.get("/tickets/", tickets);
router.post("/add-ticket/", ticketValidators, addTicket);
router.post("/add-table/", tableValidators, addTable);
router.get("/delete-ticket/:ticket_id", deleteTicket);
router.get("/delete-table/:table_id", deleteTable);
router.get("/edit-ticket/:ticket_id", editTicket);
router.post("/edit-ticket/:ticket_id", updateTicket);
router.get("/edit-table/:table_id", editTable);
router.post("/edit-table/:table_id", updateTable);
router.get("/edit-event/:event_id", editEvent);
router.post("/edit-event/:event_id", updateEvent);
router.get("/profile/", profile);
router.get("/edit-profile/", editAdmin);
router.post("/edit-profile/", editAdminValidators,updateAdmin);
router.get("/changeEmail/", editEmail);
router.post("/changeEmail/", adminEmailValidator, updateEmail);
router.get("/changePassword/", editPassword);
router.post("/changePassword/", passwordValidator, updatePassword);





router.get('/clients', async (req, res) => {
    let clients = await Client.fetch()
    for (const client of clients) {
        client.table = await Table.findById(client.table_id)
        client.ticket = await Ticket.findById(client.ticket_id)
        console.log(client.table, client.ticket);
    }
    res.render('clients', { clients })
})

router.get('/galleries/', async (req, res) => {
    let galleries = await Gallery.fetch()
    res.render('galleries', { galleries })
})

router.post('/add-image/', addImage)
router.post('/edit-image/:image_id', updateImage)
router.get('/delete-image/:image_id', async (req, res) => {
    let gallery = await Gallery.findById(req.params.image_id)
    if (!gallery) {
        return res.redirect('/admin/galleries')
    }
    await gallery.delete()
    req.flash('success', 'Image has been deleted successfully')
    res.redirect('/admin/galleries')
})
router.get('/delete-event/:event_id', async (req, res) => {
    let event = await Event.findById(req.params.event_id)
    if (!event) {
        return res.redirect('/admin/event/')
    }
    await event.delete()
    req.flash('success', 'Event has been deleted successfully')
    res.redirect('/admin/event/')
})
router.get('/messages/', async (req, res) => {
    let messages = await Contact.fetch()
    res.render('messages', { messages })
})


router.post('/reply/message/', replyValidators, async (req, res) => {
    let messages = await Contact.findById(req.body.message_id)
    messages.status = 'replied'
    let email = req.body.email
    let subject = req.body.subject
    let name = req.body.name
    let message = req.body.message
    replyEmail(email, subject, name, message);
    messages.update()
    req.flash('success', 'Message sent successfully');
    res.redirect('/admin/messages/')
})


router.get('/logout', async (req, res) => {
    delete req.session.admin
    res.redirect('/admin/login')
})

module.exports = router