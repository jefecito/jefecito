/* jshint esversion: 6 */

// REQUIREs
// ==============================================
// ==============================================
var express       = require('express');
var router        = express.Router();
var passport      = require('passport');
var bcrypt        = require('bcrypt-nodejs');
var validator     = require('validator');
var mw            = require('../middlewares/app');
const mongoose    = require('mongoose')
const User        = mongoose.model('User')
var nodemailer    = require('nodemailer');
var path          = require('path');
// var EmailTemplate = require('email-templates').EmailTemplate;
// var confirmEmail  = path.join(__dirname, '../templates', 'confirmemail');
// var emailConfirm  = new EmailTemplate(confirmEmail);
var appConfig     = require('../config/config');
var emailConfig   = require('../config/app');
var transporter   = emailConfig.getTransporter();
var jwt           = require('jsonwebtoken');

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

  router.post('/login', mw.rateLimiter, (req, res, next) => {
    console.log('aca')
    passport.authenticate('local-login', (err, user, info) => {
      if(err)
        return next(err);

      if(!user)
        return res.json({success: false, data: 'Correo o contraseña incorrectos'});

        console.log('aca2')
      req.logIn(user, (err) => {
        if(err)
          return next(err);

          console.log('aca3')
        if(!req.user.local.isConfirmed)
          return res.json({success: false, data: 'Usuario no confirmado'});
        else {
          console.log('aca4')
          return (req.user.local.roles.indexOf('admin') == -1) ?
            res.json({success: true, data: {redirect: '/user', user: user}}) :
            res.json({success: true, data: {redirect: '/dashboard', user: user}});
        }
      });
    })(req, res, next);
  }); // POST /login

  // TWITTER LOGIN
  // ==============================================
  router.get('/auth/twitter', passport.authenticate('twitter'));

  router.get('/auth/twitter/callback', (req, res, next) => {
    passport.authenticate('twitter', (err, user, info) => {
      if(err)
        return next(err);

      if(!user)
        return res.json({success: false, data: 'Authentication failed'});

      req.logIn(user, (err) => {
        if(err)
          return next(err);
        else {
          if(user.local.roles.indexOf('admin') == -1)
            res.redirect('/usuario/perfil/'+req.user._id);
          else
            res.redirect('/admin/panel');
        }
      });
    })(req, res, next);
  }); // GET /auth/twitter/callback

  // FACEBOOK LOGIN
  // ==============================================
  router.get('/auth/facebook', passport.authenticate('facebook', {
    scope : 'email'
  }));

  router.get('/auth/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', (err, user, info) => {
      if(err)
        return next(err);

      if(!user)
        return res.json({success: false, data: 'Authentication failed'});

      req.logIn(user, (err) => {
        if(err)
          return next(err);
        else {
          if(user.local.roles.indexOf('admin') == -1)
            res.redirect('/usuario/perfil/'+req.user._id);
          else
            res.redirect('/admin/panel');
        }
      });
    })(req, res, next);
  }); // GET /auth/facebook/callback

  // LINKEDIN LOGIN
  // ==============================================
  router.get('/auth/linkedin', passport.authenticate('linkedin'));

  router.get('/auth/linkedin/callback', (req, res, next) => {
    passport.authenticate('linkedin', (err, user, info) => {
      if(err)
        return next(err);

      if(!user)
        return res.json({success: false, data: 'Authentication failed'});

      req.logIn(user, (err) => {
        if(err)
          return next(err);
        else {
          if(user.local.roles.indexOf('admin') == -1)
            res.redirect('/usuario/perfil/'+req.user._id);
          else
            res.redirect('/admin/panel');
        }
      });
    })(req, res, next);
  }); // GET '/auth/linkedin/callback

  // GOOGLE LOGIN
  // ==============================================
  router.get('/auth/google', passport.authenticate('google', {
    scope: [
      'profile',
      'email'
    ]
  }));

  router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if(err)
        return next(err);

      if(!user)
        return res.json({success: false, data: 'Authentication failed'});

      req.logIn(user, (err) => {
        if(err)
          return next(err);
        else {
          if(user.local.roles.indexOf('admin') == -1)
            res.redirect('/usuario/perfil/'+req.user._id);
          else
            res.redirect('/admin/panel');
        }
      });
    })(req, res, next);
  }); // GET /auth/google/callback


// LOGOUT
// ==============================================
// ==============================================
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


// REGISTER STRATEGIE
// ==============================================
// ==============================================
router.get('/register', mw.rateLimiter, (req, res) => {
  res.render('register', {
    app: appConfig
  });
}); // GET /register

router.post('/register', mw.rateLimiter, (req, res) => {
  var username = validator.escape(req.body.username) || '',
      password = req.body.password || '',
      email    = req.body.email || '';

  if(validator.isEmail(email) && password.length >7) {
    User.findOne({'local.email': email}, (err, user) => {
      if(err) {
        return res.failure(-1, err, 200);
      } else if(!user) {
        var newUser = new User();
        newUser.local.createdAt      = Date.now();
        newUser.local.username       = username;
        newUser.local.password       = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
        newUser.local.email          = email;
        newUser.local.roles          = ['user'];
        newUser.local.creationMethod = 'local';

        newUser.save((err, data) => {
          if(err) {
            console.log('err on db user save', err);
            return res.failure(-1, 'Error guardando el usuario', 200);
          } else {
            var info = {
              app: appConfig,
              username: data.local.username,
              id: data._id
            };

            emailConfirm.render(info, (err, result) => {
              if(err) {
                console.log(err);
              } else {
                var mailOptions = {
                  from: 'info@debugthebox.com',
                  to: [email],
                  subject: 'Bienvenido '+data.local.username+' a '+appConfig.appName,
                  html: result.html
                };

                transporter.sendMail(mailOptions, (error, info) => {
                  if(error)
                    console.log(error, info);
                  else
                    console.log('Message sent: ' + info.response);
                });
              }
            });

            return res.success('Usuario registrado correctamente', 200);
          }
        });
      } else
        return res.failure(-1, 'Ese correo existe, pruebe registrarse con otro', 200);
    });
  } else
    return res.failure(-1, 'Datos inválidos', 200);
}); // POST /register


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
router.put("/access/token", mw.rateLimiter, mw.requireLogin, (req, res, next) => {

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