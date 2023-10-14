const Admin = require("../models/admin");
var randtoken = require("rand-token");
const { generate } = require('password-hash');
const loginInfoEmail = require("../models/loginInfoEmail");
const { query } = require("../models/connection");
const Ticket = require("../models/tickets");
const Gallery = require("../models/galleries");
const Event = require("../models/events");
const Table = require("../models/tables");

let postAdmin = async (req, res, next) => {
  let { modal, ...otherFields } = req.body
  let admin = new Admin(otherFields)
  var password = randtoken.generate(15)
  var name = req.body.first_name + ' ' + req.body.last_name
  var email = req.body.email
  admin.password = generate(password)
  let save = await admin.save()
  if (save) {
    loginInfoEmail(email, password, name)
    req.flash('success', 'Worker added successfully')
    res.redirect("/admin/admins/")
  }
};
let setPassword = async (req, res) => {
  res.render('set-password')
}
let tickets = async (req, res) => {
  let tickets = await Ticket.fetch();
  let tables = await Table.fetch();
  res.render('tickets', { tables, tickets })
}
let addTicket = async (req, res, next) => {
  let { modal, 'tables': tables, ...otherFields } = req.body
  let ticket = new Ticket(otherFields)
  if (tables == undefined) {
    ticket.tables = null
  } else {
    ticket.tables = Array.isArray(tables) ? JSON.stringify(tables) : JSON.stringify([tables])
  }
  await ticket.save()
  req.flash('success', 'Ticket added successfully')
  res.redirect("/admin/tickets/")
};
let deleteTicket = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect('/admin/login')
  }
  let ticket = await Ticket.findById(req.params.ticket_id)
  if (!ticket) {
    return res.redirect('/admin/tickets')
  }
  await ticket.delete()
  req.flash('success', 'Ticket has been deleted successfully')
  res.redirect('/admin/tickets')
}
let deleteTable = async (req, res) => {
  let admin_id = req.params.admin_id || req?.session?.admin?.id;
  if (!admin_id) {
    return res.redirect('/admin/login')
  }
  let table = await Table.findById(req.params.table_id)
  if (!table) {
    return res.redirect('/admin/tickets')
  }
  await table.delete()
  req.flash('success', 'Table has been deleted successfully')
  res.redirect('/admin/tickets')
}
let editTicket = async (req, res) => {
  let ticket = await Ticket.findById(req.params.ticket_id)
  if (!ticket) {
    return res.redirect('/admin/tickets')
  }
  let tables = await Table.fetch()
  res.render('editTicket', { ticket, tables })
}
let updateTicket = async (req, res) => {
  let ticket = await Ticket.findById(req.params.ticket_id)
  if (!ticket) {
    return res.redirect('/admin/tickets')
  }
  let { 'tables': tables, ...otherFields } = req.body
  if (tables == undefined) {
    ticket.tables = null
  } else {
    ticket.tables = Array.isArray(tables) ? JSON.stringify(tables) : JSON.stringify([tables])
  }
  ticket.setProperties(otherFields)
  ticket.update()
  req.flash('success', 'Ticket has been updated successfully')
  res.redirect('/admin/tickets/')
}
let editTable = async (req, res) => {
  let table = await Table.findById(req.params.table_id)
  if (!table) {
    return res.redirect('/admin/tickets')
  }
  res.render('editTable', { table })
}
let updateTable = async (req, res) => {
  let table = await Table.findById(req.params.table_id)
  if (!table) {
    return res.redirect('/admin/tickets')
  }
  table.setProperties(req.body)
  table.update()
  req.flash('success', 'Table has been update successfully')
  res.redirect('/admin/tickets/')
}
let editEvent = async (req, res) => {
  let event = await Event.findById(req.params.event_id)
  if (!event) {
    return res.redirect('/admin/event/')
  }
  res.render('editEvent', { event })
}
let updateEvent = async (req, res) => {
  let event = await Event.findById(req.params.event_id)
  if (!event) {
    return res.redirect('/admin/event')
  }
  event.setProperties(req.body)
  if (req.files && req.files.passport != undefined) {
    let passport = req.files.passport
    if (passport.mimetype.startsWith('image/')) {
      if (passport.size <= 2 * 1024 * 1024) {
        var fileName = `${uuid()}.${passport.name.split('.').pop()}`
        passport.mv('./uploads/' + fileName, (err) => {
          if (err) {
            console.log(err)
          }
        })
      } else {
        req.flash('danger', `File too large! Upload unsuccessful. Try again with a smaller file...`);
        return res.redirect('back')
      }
    } else {
      return redirect('back')
    }
    event.image = fileName
  }
  await event.update()
  req.flash('success', 'Event has been update successfully')
  res.redirect('/admin/event/')
}
let addTable = async (req, res, next) => {
  let { modal, ...otherFields } = req.body
  let table = new Table(otherFields)
  await table.save()
  req.flash('success', 'Table added successfully')
  res.redirect("/admin/tickets/")
};
let addEvent = async (req, res, next) => {
  // console.log(req.body);return
  let { modal, ...otherFields } = req.body
  let event = new Event(otherFields)
  if (req.files && req.files.passport != undefined) {
    let passport = req.files.passport
    if (passport.mimetype.startsWith('image/')) {
      if (passport.size <= 2 * 1024 * 1024) {
        var fileName = `${uuid()}.${passport.name.split('.').pop()}`
        passport.mv('./uploads/' + fileName, (err) => {
          if (err) {
            console.log(err)
          }
        })
      } else {
        req.flash('danger', `File too large! Upload unsuccessful. Try again with a smaller file...`);
        return res.redirect('back')
      }
    } else {
      return redirect('back')
    }
    event.image = fileName
  }
  await event.save()
  req.flash('success', 'Event added successfully')
  res.redirect("/admin/event/")
};

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

let addImage = async (req, res) => {
  let gallery = new Gallery(req.body);
  if (req.files && req.files.passport != undefined) {
    let passport = req.files.passport
    if (passport.mimetype.startsWith('image/')) {
      if (passport.size <= 2 * 1024 * 1024) {
        var fileName = `${uuid()}.${passport.name.split('.').pop()}`
        console.log(fileName);
        passport.mv('./uploads/' + fileName, (err) => {
          if (err) {
            console.log(err)
          } else {
            gallery.image = fileName
            gallery.save();
          }
        })
      } else {
        req.flash('danger', `File too large! Upload unsuccessful. Try again with a smaller file...`);
        return res.redirect('back')
      }
    } else {
      return redirect('back')
    }
  }
  // await gallery.save()
  req.flash('success', 'Added successfully')
  res.redirect('/admin/galleries')
}

let updateImage = async (req, res) => {
  let gallery = await Gallery.findById(req.params.image_id)
  if (req.files && req.files.passport != undefined) {
    let passport = req.files.passport
    if (passport.mimetype.startsWith('image/')) {
      if (passport.size <= 2 * 1024 * 1024) {
        var fileName = `${uuid()}.${passport.name.split('.').pop()}`
        console.log(fileName);
        passport.mv('./uploads/' + fileName, (err) => {
          if (err) {
            console.log(err)
          } else {
            gallery.image = fileName
            gallery.update();
          }
        })
      } else {
        req.flash('danger', `File too large! Upload unsuccessful. Try again with a smaller file...`);
        return res.redirect('back')
      }
    } else {
      return redirect('back')
    }
  }
  // console.log(gallery);
  // console.log(fileName);return
  await gallery.update();
  req.flash('success', 'Image updated successfully')
  res.redirect('/admin/galleries')
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
module.exports = { postAdmin, setPassword, setUpdatePassword ,editPassword, updatePassword, editEmail, updateEmail,editAdmin, updateAdmin, deleteAdmin, tickets, addTicket, profile,addTable, addImage, updateImage, addEvent, deleteTicket, deleteTable, editTicket, updateTicket, editTable, updateTable, editEvent, updateEvent}