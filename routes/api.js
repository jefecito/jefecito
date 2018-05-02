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