const Student = require("../models/students")
const { query } = require("../models/connection")

let index= async(req, res) =>{
    res.render('index')
}

let uuid = async function() {
    let ticket_no =  `xxxx-xxxx-xyxx-4xxy`.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return   v.toString(16);
    });
    while (await Student.ticketNoExists(ticket_no)) {
        ticket_no =  `xxxx-xxxx-xyxx-4xxy`.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
       return      v.toString(16);
        });
    }
    return ticket_no;
}

let bookTicket  = async (req, res) => {
    let { modal, ...otherFields } = req.body
    let student = new Student(otherFields)
    student.ticket_no = await uuid()
    req.session.student = student;
    req.session.save(function (err) {
        if (err) return next(err);
    });
    student.save()
    res.redirect('/ticket/payment/')
}

module.exports = {index, bookTicket}