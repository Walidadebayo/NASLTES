const { Router } = require('express');
const { index, contact, bookTicket } = require('../controllers/clientController');
const { generate, verify } = require('password-hash');
const Admin = require('../models/admin');
const { setPassword, setUpdatePassword } = require('../controllers/adminController');
const set_passwordValidator = require('../validators/set_passwordValidator');
const axios = require('axios');
const bookTicketValidators = require('../validators/bookTicketValidator');
const Student = require('../models/students');
var randtoken = require("rand-token");
require('dotenv').config()
const sendEmail = require('../models/forgetPassword');
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const ticketEmail = require('../models/ticketEmail');
const cancelledPayment = require('../models/cancelledPayment');
const { createCanvas } = require('canvas');

const fs = require('fs');
const router = Router()

router.get('/', index)
router.get('/admin/login', async (req, res) => {
  res.render('login')
})
router.get("/forget-password", (req, res, next) => {
  res.render("forget-password");
});

router.post("/forget-password", async (req, res, next) => {
  var email = req.body.email;
  let admin = await Admin.findByEmail(email);
  if (admin == null) {
    req.flash("danger", "No registered account with this email");
    return res.redirect("back");
  }
  var domain = req.get('host');
  var name = admin.first_name
  const token = randtoken.generate(30);
  var sent = sendEmail(email, token, name, domain);
  if (sent != '0') {
    admin.token = token;
    await admin.update();
    req.flash("success", "Reset link has been sent to your email address");
    res.redirect("/forget-password");
  } else {
    req.flash('danger', 'Something goes Wrong. Please try again')
  }
});

router.post('/admin/login', async (req, res) => {
  let admin = await Admin.findByEmail(req.body.email);
  if (!admin) {
    req.flash('danger', 'Access denied')
    return res.redirect('back')
  }
  if (admin.account_state === 'activated' && verify(req.body.password, admin.password)) {
    req.session.admin = admin;
    req.flash('success', `Welcome ${admin.name}`);
    res.redirect(req?.session?.intent || '/admin/students');
  } else if (admin.account_state === 'deactivated' || admin.account_state === null && verify(req.body.password, admin.password)) {
    req.session.email = req.body.email;
    req.session.save(function (err) {
      if (err) return next(err);
    });
    req.flash('danger', 'Create a new password');
    return res.redirect('/setPassword/')
  } else {
    req.flash('danger', 'Invalid email or password');
    res.redirect('back')
  }
})
router.get("/setPassword/", setPassword);
router.post("/setPassword/", set_passwordValidator, setUpdatePassword);
router.post('/book/ticket/', bookTicketValidators, bookTicket)
router.get('/ticket/payment/', async (req, res) => {
  let student = req.session.student
  if (!student) {
    req.flash('danger', 'Something went wrong. Please try again')
    return res.redirect('/#Ticket')
  }

  var domain = req.get('host');
  let tx_ref = async function () {
    let tx_ref = `xxxx-xxxx-xyxx-4xxy`.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    while (await Student.txRefExists(tx_ref)) {
      tx_ref = `xxxx-xxxx-xyxx-4xxy`.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    return tx_ref;
  }
  var data = JSON.stringify({
    "tx_ref": await tx_ref(),
    "amount": "2000",
    "currency": "NGN",
    "subaccounts": [
      {
        id: "RS_48B0A45D0B98AB9C7E4DFFD0C7B7133F"
      }
    ],
    "redirect_url": "https://nasltes.onrender.com/transaction/verification",
    "meta": {
      "consumer_id": student.id,
      "ticket_number": student.ticket_no
    },
    "customer": {
      "email": student.student_email,
      "phonenumber": student.phone,
      "name": student.full_name
    },
    "customizations": {
      "title": "Regular Ticket Payment",
      "description": "Payment for regular ticket",
      "logo": "https://nasltes.onrender.com/img/logo.png"
    }
  });

  var config = {
    method: 'post',
    url: 'https://api.flutterwave.com/v3/payments',
    headers: {
      'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    data: data
  };
  axios(config)
    .then(function (response) {
      let data = response.data
      let link = data.data.link
      res.render('payment-gateway', {
        title: 'Payment',
        student: student,
        checkout_payment: link
      })
    })
    .catch(function (error) {
      console.log(error);
    });
})

router.get('/transaction/verification', async (req, res) => {
  let student = req.session.student
  if (!student) {
    return res.redirect('/#Ticket')
  }
  var domain = req.get('host');

  var students = await Student.findByTicketNo(student.ticket_no)
  flw.Transaction.verify({ id: req.query.transaction_id ? req.query.transaction_id : req.query.tx_ref })
    .then(async (response) => {
      if (response.status === "successful") {
        let reference = req.query.transaction_id;
        students.payment_status = response.status;
        students.transaction_id = reference;
        students.tx_ref = req.query.tx_ref;
        ticketEmail(student.student_email, student.full_name, student.ticket_no, domain);
        await students.update();
        req.flash('success', "Your ticket has been purchased successfully and sent to your mail address")
        res.redirect('/#Ticket')
      } else {
        students.payment_status = req.query.status;
        cancelledPayment(student.student_email, student.full_name, domain);
        await students.update();
        req.flash('danger', "Your ticket payment was not successful. Please try again")
        res.redirect('/#Ticket')
      }
    })
    .catch(console.log);
})
ticketEmail("apantakupaul2306@gmail.com", "Apantaku Paul Olamiposi", "e616-60b8-4a0e-48bb", "nasltes.onrender.com");

router.get('/failed/transaction', async (req, res) => {

  if (req.session.student === undefined || req.session.student === null) {
    return res.redirect('/#Ticket')
  }
  var student = await Student.findByTicketNo(req.session.student.ticket_no)
  student.payment = 'unsuccessful';
  student.reference_no = 'failed';
  await student.update()
  req.flash('danger', 'Payment failed')
  res.redirect('/#Ticket')
})


router.get('/download-ticket/:ticketno', async(req, res)=>{

var student = await Student.findByTicketNo(req.params.ticketno);
if(!student){
  req.flash('danger', 'Student ticket not found. Kindly contact us. If you booked a ticket');
  return res.redirect('/#Ticket')
}
const studentname = student.full_name;
const ticketNumber = student.ticket_no;
const canvas = createCanvas(600, 300);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#a0c4ff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.font = 'bold 60px Arial';
ctx.fillStyle = '#1977cc';
ctx.fillText('NASLTES', 70, 80);
ctx.font = 'bold 40px Arial';
ctx.fillStyle = '#06aa00';
ctx.fillText(studentname, 70, 170);
ctx.font = '30px Arial';
ctx.fillStyle = '#feaa11';
ctx.fillText(`Ticket Number: ${ticketNumber}`, 70, 240);

const img = fs.createWriteStream(`${studentname}_nasltes_ticket.png`);
const stream = canvas.createPNGStream();
stream.pipe(img);
img.on('finish', () => {
  try{
    const file = fs.readFileSync(`${studentname}_nasltes_ticket.png`);
    res.setHeader('Content-disposition', `attachment; filename=${studentname}_nasltes_ticket.png`);
    res.setHeader('Content-type', 'image/png');
    res.send(file);
  }catch(e){
    console.error(e);
    res.redirect('/#Ticket')
  }
});
})

module.exports = router
