const { Router } = require('express');
const { index, contact, bookTicket } = require('../controllers/clientController');
const { generate, verify } = require('password-hash');
const Admin = require('../models/admin');
const { setPassword, setUpdatePassword } = require('../controllers/adminController');
const set_passwordValidator = require('../validators/set_passwordValidator');
const axios = require('axios');
var FormData = require('form-data');
const bookTicketValidators = require('../validators/bookTicketValidator');
const Student = require('../models/students');
var randtoken = require("rand-token");
require('dotenv').config()
const sendEmail = require('../models/forgetPassword');
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const ticketEmail = require('../models/ticketEmail');
const router = Router()

router.get('/', index)
router.get('/admin/login', async(req, res) => {
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
  var domain =req.get('host');
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

router.post('/admin/login', async(req, res) => {
    let admin = await Admin.findByEmail(req.body.email)
    if (!admin) {
        req.flash('danger', 'Access denied')
        return res.redirect('back')
      }
      if (admin.account_state === 'activated' && verify(req.body.password, admin.password)) {
        req.session.admin = admin;
        req.flash('success', `Welcome ${admin.name}`);
        res.redirect(req?.session?.intent || '/admin/students');
      } else if (admin.account_state === 'deactivated' && verify(req.body.password, admin.password)) {
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
router.post('/book/ticket/', bookTicketValidators,bookTicket)
router.get('/ticket/payment/', async (req, res) => {
let student = req.session.student
if (!student) {
  req.flash('danger', 'Something went wrong. Please try again')
  return res.redirect('/#Ticket')
}

var domain =req.get('host');
let tx_ref = async function() {
  let tx_ref =  `xxxx-xxxx-xyxx-4xxy`.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return   v.toString(16);
  });
  while (await Student.txRefExists(tx_ref)) {
      tx_ref =  `xxxx-xxxx-xyxx-4xxy`.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
     return      v.toString(16);
      });
  }
  return tx_ref;
}
var data = JSON.stringify({
  "tx_ref": await tx_ref(),
  "amount": "1000",
  "currency": "NGN",
  "redirect_url": domain +"/transaction/verification",
    "meta": {
      "consumer_id": student.id,
      "ticket_number": student.ticket_no
  },
    "customer": {
      "email": student.student_email,
      "phonenumber":student.phone,
      "name": student.full_name
  },
  "customizations": {
    "title": "Regular Ticket Payment",
    "description": "Payment for regular ticket",
    "logo": domain+"/img/logo.png"
  }
// var data = JSON.stringify({
//   "email": student.student_email,
//   "amount": 1000 * 100,
//   "callback_url": domain +"/transaction/verification",
//   "metadata": {
//     "cancel_action": domain + "/failed/transaction/",
//     "custom_fields": [
//       {
//         "display_name": "Student Name",
//         "variable_name": "student_name",
//         "value": student.full_name
//       },
//       {
//         "display_name": "Student Email",
//         "variable_name": "student_email",
//         "value": student.student_email
//       },
//       {
//         "display_name": "Student Phone",
//         "variable_name": "student_phone",
//         "value": student.phone
//       },
//       {
//         "display_name": "Student Ticket",
//         "variable_name": "student_ticket",
//         "value": student.ticket_no
//       }
//     ]
//   }
});

var config = {
  method: 'post',
  url: 'https://api.flutterwave.com/v3/payments',
  headers: {
    'Authorization':  `Bearer ${process.env.FLW_SECRET_KEY}`,
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
  var domain =req.get('host');

  var students = await  Student.findByTicketNo(student.ticket_no)
  // var data = new FormData();
  // var config = {
  //   method: 'get',
  //   url: `https://api.paystack.co/transaction/verify/${req.query.reference}`,
  //   headers: {
  //     'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
  //     ...data.getHeaders()
  //   },
  //   data: data
  // };

  // axios(config)
  //   .then(async function (response) {
  //     if (response.data.data.status === 'success') {
  //       let reference = req.query.reference;
  //       students.payment_status = response.data.data.status;
  //       students.reference_no = reference;
  //       ticketEmail(student.email, student.full_name, student.ticket_no, domain);
  //       await students.update();
  //       req.flash('success', "Your ticket has been purchased successfully and sent to your mail address")
  //       res.redirect('/#Ticket')
  //     }
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });
    flw.Transaction.verify({ id: transactionId })
    .then(async(response) => {
        if (
            response.data.status === "successful"
            && response.data.amount === expectedAmount
            && response.data.currency === expectedCurrency) {
              let reference = req.query.transaction_id;
              students.payment_status = response.data.status;
              students.transaction_id = reference;
              students.tx_ref = req.query.tx_ref;
              ticketEmail(student.email, student.full_name, student.ticket_no, domain);
              await students.update();
              req.flash('success', "Your ticket has been purchased successfully and sent to your mail address")
              res.redirect('/#Ticket')
            } else {
              req.flash('success', "Your ticket payment was not successful. Please try again")
              res.redirect('/#Ticket')
        }
    })
    .catch(console.log);
})
router.get('/failed/transaction', async (req, res) => {
  if (req.session.student === undefined || req.session.student === null) {
    return res.redirect('/#Ticket')
  }
  var student = await  Student.findByTicketNo(req.session.student.ticket_no)
  student.payment = 'unsuccessful';
  student.reference_no = 'failed';
  await student.update()
  req.flash('danger', 'Payment failed')
  res.redirect('/#Ticket')
})

module.exports = router
