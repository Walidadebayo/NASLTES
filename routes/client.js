const { Router } = require('express');
const { index, contact, bookTicket } = require('../controllers/clientController');
const { generate, verify } = require('password-hash');
const Admin = require('../models/admin');
const { setPassword, setUpdatePassword } = require('../controllers/adminController');
const set_passwordValidator = require('../validators/set_passwordValidator');
const axios = require('axios');
var FormData = require('form-data');
const bookTicketValidators = require('../validators/bookTicketValidator');
const Ticket = require('../models/tickets');
const Tables = require('../models/tables');
const { findByTicketNo } = require('../models/clients');
const Client = require('../models/clients');
var randtoken = require("rand-token");
const contactValidators = require('../validators/contactValidator');
const sendEmail = require('../models/forgetPassword');
const ticketEmail = require('../models/ticketEmail');
const router = Router()

router.get('/', index)
router.post('/send/message', contactValidators,contact)
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
  var name = admin.first_name
  const token = randtoken.generate(30);
  var sent = sendEmail(email, token, name);
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
        res.redirect(req?.session?.intent || '/admin/clients');
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
let client = req.session.client
let price = req.session.price
if (!client || !price) {
  req.flash('danger', 'Something went wrong. Please try again')
  return res.redirect('/#Ticket')
}
let ticket = await Ticket.findById(client.ticket_id);
let ticket_name = ticket.type
if (client.table_id !== undefined) {
  var table = await Tables.findById(client.table_id);
  var table_name = table.name
  if (!table) {
    req.flash('danger', 'Something went wrong. Please try again')
    return res.redirect('/#Ticket')
  }
  
}else{
 var table_name = undefined
}

var data = JSON.stringify({
  "email": client.client_email,
  "amount": price * 100,
  "callback_url": "http://localhost:4000/transaction/verification",
  "metadata": {
    "cancel_action": "http://localhost:4000/failed/transaction/",
    "custom_fields": [
      {
        "display_name": client.full_name,
        "variable_name": "mobile_number",
        "variable_name": "client_email",
        "value": client.client_email
      }
    ]
  }
});

var config = {
  method: 'post',
  url: 'https://api.paystack.co/transaction/initialize',
  headers: {
    'Authorization': 'Bearer sk_live_392a4907f8b07d7e4b9a1105a0a77438a1af0779',
    'Content-Type': 'application/json'
  },
  data: data
};
axios(config)
.then(function (response) {
  let data = response.data
  let link = data.data.authorization_url
  res.render('payment-gateway', {
    title: 'Payment',
    client: client,
    price: price,
    table_name: table_name,
    ticket_name: ticket_name,
    checkout_payment: link
  })
})
.catch(function (error) {
  console.log(error);
});
})

router.get('/transaction/verification', async (req, res) => {
  let client = req.session.client
  let price = req.session.price
  if (!client || !price) {
    return res.redirect('/#Ticket')
  }
  var clients = await  Client.findByTicketNo(client.ticket_no)
  var data = new FormData();
  var config = {
    method: 'get',
    url: `https://api.paystack.co/transaction/verify/${req.query.reference}`,
    headers: {
      'Authorization': 'Bearer sk_live_392a4907f8b07d7e4b9a1105a0a77438a1af0779',
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(async function (response) {
      if (response.data.data.status === 'success') {
        let reference = req.query.reference;
        clients.payment = response.data.data.status;
        var name = client.first_name+" "+client.last_name
        clients.reference_no = reference;
        ticketEmail(client.email, name, client.ticket_no);
        await clients.update();
        req.flash('success', "Your ticket has been purchased successfully and sent to your mail address")
        res.redirect('/#Ticket')
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  console.log(order);
})
router.get('/failed/transaction', async (req, res) => {
  if (req.session.client === undefined || req.session.client === null) {
    return res.redirect('/#Ticket')
  }
  var client = await  Client.findByTicketNo(req.session.client.ticket_no)
  client.payment = 'unsuccessful';
  client.reference_no = 'transaction failed';
  await client.update()
  req.flash('danger', 'Payment failed')
  res.redirect('/#Ticket')
})

module.exports = router
