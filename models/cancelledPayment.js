const nodemailer = require('nodemailer');

function cancelledPayment(email, name, domain) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "apantakupaul2306@gmail.com", // Your email id
          pass: "onrqzpkmztufqrbq", // Your password
        },
      });
      var mailOptions = {
        from: {name:'NASLTES', address:'apantakupaul2306@gmail.com'},
        to: email,
        subject: 'Ticket payment was unsuccessful / cancelled',
        html: `<!doctype html>
        <html lang="en-US">
        
        <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <meta name="description" content="Reset Password Email Template.">
            <style type="text/css">
                a:hover {text-decoration: underline !important;}
            </style>
        </head>
        
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
            <!--100% body table-->
            <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                <tr>
                    <td>
                        <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                            align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                          
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>
                                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                        <td style="text-align:center;">
                                          <a href="${domain}" title="logo" target="_blank">
                                            <img width="100" style="border-radius: 50%;" src="${domain}/img/logo.png" title="logo" alt="logo">
                                          </a>
                                        </td>
                                    </tr>
                                        <tr>
                                            <td style="padding:0 35px;">
                                            <h1>From ${name},</h1>
                                                <h3>Your ticket payment was not unsuccessful / cancelled</h3>
                                                <h6>If you have any issue in payment. Kindly reply to this email.</h6>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="text-align:center;">
                                    <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>Adeal</strong></p>
                                </td>
                            </tr>
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        `,
      };
      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent');
          }
        });
}
module.exports = cancelledPayment;