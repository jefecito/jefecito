/* jshint esversion: 6 */

// REQUIREs
// ==============================================
// ==============================================
const express       = require('express')
const router        = express.Router()
const passport      = require('passport')
const bcrypt        = require('bcrypt')
const validator     = require('validator')
const mw            = require('../middlewares/app')
const mongoose    = require('mongoose')
const User        = mongoose.model('User')
const nodemailer    = require('nodemailer')
const path          = require('path')
// const EmailTemplate = require('email-templates').EmailTemplate;
// const confirmEmail  = path.join(__dirname, '../templates', 'confirmemail');
// const emailConfirm  = new EmailTemplate(confirmEmail);
const appConfig     = require('../config/app/config')
const emailConfig   = require('../config/app/main')
const transporter   = emailConfig.getTransporter()
const jwt           = require('jsonwebtoken')

// LOGIN STRATEGIES
// ==============================================
// ==============================================
  // LOCAL LOGIN
  // ==============================================
  router.get('/login', mw.rateLimiter, (req, res, next) => {
    if(!req.isAuthenticated())
      res.render('login', {
        msg: '',
        app: appConfig
      });
    else if(req.user.local.roles.indexOf('admin') == -1)
      res.redirect('/user');
    else
      res.redirect('/dashboard');
  }); // GET /login
  
// REGISTER STRATEGIE
// ==============================================
// ==============================================
router.get('/register', mw.rateLimiter, (req, res) => {
  res.render('register', {
    app: appConfig
  });
}); // GET /register

// CONFIRMAR USUARIO
// ==============================================
// ==============================================
router.get('/user/confirm/:userId', mw.rateLimiter, (req, res) => {
  var id = req.params.userId;

  User.findOne({_id: id}, (err, user) => {
    if(err)
      res.json({success: false, data: err});
    else if(!user)
      res.render('login', {
        msg: 'Usuario o token inválido',
        app: appConfig,
        state: false
      });
    else {
      user.local.isConfirmed = true;
      user.save((err) => {
        if(err)
          res.json({success: false, data: err});
        else
          res.render('login', {
            msg: 'Usuario confirmado exitosamente',
            app: appConfig,
            state: true
          });
      });
    }
  });
}); // GET /user/confirm/:userId


// OLVIDAR CONTRASEÑA
// ==============================================
// ==============================================
router.get('/forgot-password', mw.rateLimiter, (req, res) => {
  res.render('forget-password', {
    app: appConfig
  });
}); // GET /forgot-password

/**
 * Esta ruta valida que el usuario esté registrado y crea un token que guarda en
 * la base de datos.Si ya existe uno, llamar este comando lo renueva.
 */
router.put("/access/token", mw.rateLimiter, mw.requireAuth, (req, res, next) => {

  //req.user guarda el usuario logueado.
  let user = req.user;

  let token = jwt.sign({
    user: user._id,
  }, appConfig.jwtSecret);

  User.findByIdAndUpdate(user._id, {
    'local.jwt': token
  }, {
    new: true
  }, (err, savedUser) => {
    if(err)
      return res.failure(-1, err, 200);
    else{
      return res.success({
        token: savedUser.local.jwt
      }, 200);
    }
  });
});

module.exports = router;