/* jshint esversion: 6 */

// REQUIREs
// ==============================================
// ==============================================
const express       = require('express')
const passport      = require('passport')
const router        = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const mw            = require('../middlewares/app')
const validator     = require('validator')
const bcrypt        = require('bcrypt')
const randomstring  = require("randomstring")
const path          = require('path')
const appConfig     = require('../config/app/main')
// var EmailTemplate = require('email-templates').EmailTemplate;
// var resetEmail    = path.join(__dirname, '../templates', 'resetemail');
// var emailTx       = new EmailTemplate(resetEmail);
const transporter   = appConfig.getTransporter()
const app           = require('../server')


// API USUARIOS
// ==============================================
// ==============================================
  // Usuario consulta para nuevo token para recibir nueva contraseña
  // ==============================================
  router.post('/api/user/token', mw.rateLimiter, (req, res) => {
    var email = req.body.email;

    if(validator.isEmail(email)) {
      User.findOne({'local.email': email}, (err, user) => {
        if(!user) {
          console.log('not sending user doesnt exist');
          return res.success('En breve recibirá un correo con un link a la dirección indicada', 200);
        } else {
          if(user.local.creationMethod == 'local') {
            user.local.resetToken        = randomstring.generate(50);
            user.local.resetTokenExpires = Date.now() + 3600000; // 1 hora
            user.save((err) => {
              if(err) {
                return res.failure(-1, err, 200);
              } else {
                var info = {
                  app: appConfig,
                  user: user.local.username,
                  email: email,
                  token: user.local.resetToken
                }; // info

                emailTx.render(info, (err, result) => {
                  if(err) {
                    console.log(err);
                  } else {
                    var mailOptions = {
                      from: 'no-reply@debugthebox.com', 
                      to: [email, 'maxi.canellas@gmail.com', 'nestor.2005@gmail.com'],
                      subject: 'Resetear contraseña',
                      html: result.html
                    }; // mailOptions

                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error)
                        console.log(error, info);
                      else
                        console.log('Message sent: ' + info.response);
                    }); // transporter.sendMail()
                  } // if/else
                }); // emailTx.render()
                return res.success('En breve recibirá un correo con un link a la dirección indicada', 200);
              } // if/else
            });
          } else {
            console.log('not sending user not local');
            return res.success('En breve recibirá un correo con un link a la dirección indicada', 200);
          } // if/else
        } // if/else
      }); // User.find()
    } else
      return res.failure(-1, 'Ingrese un email válido', 200);
  }); // POST /api/user/token

  // Renderiza "passwordreset" con el token, para cambiar password
  // ==============================================
  router.get('/user/reset/:token', mw.rateLimiter, (req, res) => {
    var token = req.params.token || '';

    User.findOne({
      'local.resetToken': token,
      'local.resetTokenExpires': {
          $gt: Date.now()
        }
      }, (err, user) => {
        if(!user)
          res.redirect('/login');
        else
          res.render('passwordreset', {user: user}); 
    }); /* User.findOne() */
  }); // GET /user/reset/:token

  // Usuario cambia contraseña con token (forget-password)
  // ==============================================
  router.post('/user/reset/:token', mw.rateLimiter, (req, res) => {
    var token       = req.params.token || '';
    var newPassword = req.body.password;

    if(newPassword.length > 7) {
      User.findOne({
        'local.resetToken': token,
        'local.resetTokenExpires': {
          $gt: Date.now()
        }
      }, (err, user) => {
        if(!user)
          return res.failure(-1, "Token inválido o expirado", 200);
        else {
          user.local.password          = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null);
          user.local.resetToken        = undefined;
          user.local.resetTokenExpires = undefined;
          user.save((err) => {
            return (err) ?
              res.failure(-1, err, 200) :
              res.success("Password cambiado exitosamente", 200);
          }); // user.save()
        } // if/else
      }); // User.findOne()
    } else
      return res.failure(-1, "Password inválido", 200);
  }); // POST /user/reset/:token

module.exports = router;