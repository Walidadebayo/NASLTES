const Admin = require("../models/admin");
var randtoken = require("rand-token");
const { generate } = require('password-hash');
const loginInfoEmail = require("../models/loginInfoEmail");
const { query } = require("../models/connection");

let postAdmin = async (req, res, next) => {
  let { modal, ...otherFields } = req.body
  let admin = new Admin(otherFields)
  var password = randtoken.generate(15)
  var name = req.body.first_name + ' ' + req.body.last_name
  var email = req.body.email
  admin.password = generate(password)
  let save = await admin.save()
  var domain =req.get('host');
  if (save) {
    loginInfoEmail(email, password, name, domain)
    req.flash('success', 'Admin added successfully')
    res.redirect("/admin/admins/")
  }
};
let setPassword = async (req, res) => {
  res.render('set-password')
}


let setUpdatePassword = async (req, res) => {
  var password = generate(req.body.password);
  let email = req.session.email
  if (email === undefined) {
    req.flash('danger', 'Something went wrong. Please login to continue')
    return res.redirect('/admin/login')
  }
  let sql = `UPDATE admins SET password = '${password}', account_state = 'activated' WHERE email = ?`
  await query(sql, `${email}`)
  req.flash('success', 'Account activated successfully')
  res.redirect('/admin/login/')
};
let deleteAdmin = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect('/admin/login')
  }
  let admin = await Admin.findById(req.params.admin_id)
  if (admin.id === req?.session?.admin?.id) {
    req.flash('danger', "You can't delete yourself")
    return res.redirect('/admin/admins')
  }
  await admin.delete()
  req.flash('success', 'Admin has been deleted successfully')
  res.redirect('/admin/admins')
}
let uuid = function () {
  return 'xxx-xxy-xyx-xxxx-yxxx-yxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let profile = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect("/admin/login");
  }
  let admin = await Admin.findById(admin_id);
  res.render('profile', { admin })
}
let editAdmin = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect('/admin/login')
  }
  let admin = await Admin.findById(admin_id)
  res.render('edit-admin', { admin })
}
let updateAdmin = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect('/admin/login')
  }
  let admin = await Admin.findById(admin_id);
  admin.setProperties(req.body);
  admin.update()
  req.flash('success', 'Profile updated successfully')
  res.redirect("/admin/profile");
};


let editEmail = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect('/admin/login')
  }
  let admin = await Admin.findById(admin_id);
  res.render('changeEmail', { admin })
}

let updateEmail = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect('/admin/login')
  }
  let admin = await Admin.findById(admin_id)
  let { password, ...otherFields } = req.body
  admin.setProperties(otherFields)
  admin.update()
  res.redirect("/admin/profile")
}
let editPassword = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect('/admin/login')
  }
  let admin = await Admin.findById(admin_id);
  if (admin) {
    res.render('ChangePassword', { admin })
  } else {
    res.redirect('/admin/profile')
  }
}
// console.log(generate('12345'));
let updatePassword = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect('/admin/login')
  }
  let admin = await Admin.findById(admin_id)
  let { previous_password, confirm_password, ...otherFields } = req.body
  admin.setProperties(otherFields)
  admin.password = generate(admin.password)
  await admin.update()
  req.flash('success', 'Password reset successfully')
  res.redirect('/admin/profile')
}
module.exports = { postAdmin, setPassword, setUpdatePassword ,editPassword, updatePassword, editEmail, updateEmail,editAdmin, updateAdmin, deleteAdmin, profile}