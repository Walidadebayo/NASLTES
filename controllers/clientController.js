const Gallery = require("../models/galleries")
const Ticket = require("../models/tickets")
const Event = require("../models/events")
const Client = require("../models/clients")
const sendEmail = require("../models/contactEmail")
const Contact = require("../models/contact")
const Tables = require("../models/tables")
const { query } = require("../models/connection")

let index= async(req, res) =>{
    let galleries = await Gallery.fetch()
    var firstImg = galleries[0]
    let events = await Event.fetch()
    let tickets = await Ticket.fetch()
    for (const ticket of tickets) {
        if (ticket.table !== null) {
            var tables = ticket.table;
            var table = "'" + tables.join("','") + "'";
            // console.log(table);
            let sql =  `SELECT price, name FROM tables WHERE name IN (${table})`
            var tablePrice = await query(sql)
            var tab={}
            for (const tol of tablePrice) {
                tab[tol.name] = tol.price
            }
        }
    }
    res.render('index', {galleries, tickets, events, firstImg, tab})
}
let contact  = async (req, res) => {
    let contact = new Contact(req.body)
    let email = req.body.email
    let name = req.body.name
    let subject = req.body.subject
    let message = req.body.message
    contact.save()
    sendEmail(email, name, subject, message)
    req.flash('success', 'Message sent successfully')
    res.redirect('/')
}
let uuid = async function() {
    let ticket_no =  `xxxx-xxxx-xyxx-4xxy`.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return   v.toString(16);
    });
    while (await Client.ticketNoExists(ticket_no)) {
        ticket_no =  `xxxx-xxxx-xyxx-4xxy`.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
       return      v.toString(16);
        });
    }
    return ticket_no;
}

let bookTicket  = async (req, res) => {
    let { modal, ...otherFields } = req.body
    // console.log(req.body.table_id);return
    if (req.body.table_id !== undefined) {
        var table = await Tables.findByName(req.body.table_id);
        if (!table) {
            req.flash('danger', 'Something went wrong. Please try again')
            return res.redirect('/#Ticket')
        }
        
    }
    // console.log(req.body);return
    let ticket = await Ticket.findById(req.body.ticket_id);
    let client = new Client(otherFields)
    client.ticket_no = await uuid()
    if (req.body.table_id !== undefined) {
        client.table_id = table.id;
        req.session.price = table.price;
    }else{
        req.session.price = ticket.price;
    }
    req.session.client = client;
    req.session.save(function (err) {
        if (err) return next(err);
    });
    // console.log(req.session);return
    client.save()
    // res.redirect('/#Ticket')
    res.redirect('/ticket/payment/')
}

module.exports = {index, contact, bookTicket}