/* jshint esversion: 6 */

/**
 * Modules
 */
const passport = require('passport')
const validator = require('validator')
const mongoose = require('mongoose')

/**
 * Models
 */
const User = mongoose.model('User')

/**
 * Inicio de Sesión Local
 */
exports.logInLocal = (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      return next(err)
    }
  
    if (!user) {
      return res.failure(-1, 'Correo o contraseña incorrectos', 200)
    }
  
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
  
      return (req.user.local.roles.indexOf('admin') == -1) ?
        res.success({redirect: 'user', user: user}, 200) :
        res.success({redirect: 'dashboard', user: user}, 200)
    })
  })(req, res, next)
}

/**
 * Registro Local
 */
exports.registerLocal = (req, res, next) => {
  const B = req.body
  const username = validator.escape(B.username) || ''
  const password = B.password || ''
  const email = B.email || ''
  const isValidEmail = validator.isEmail(email)

  if(isValidEmail && password.length > 7) {
    const FILTER = {
      'local.email': email
    }

    User.findOne(FILTER, (err, user) => {
      if (err) {
        return res.failure(-1, err, 200);
      } else if(!user) {
        let newUser = new User({
          local: {
            createdAt: Date.now(),
            username: username,
            email: email,
            roles: ['user'],
            creationMethod: 'local',
            isConfirmed: true // set to false when email send added
          }
        })

        newUser.local.password = newUser.generateHash(password)

        newUser.save((err, data) => {
          if (err) {
            return res.failure(-1, err, 200)
          } else {
            /*
              // Agregar envio de email

              let info = {
                app: appConfig,
                username: data.local.username,
                id: data._id
              }

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
              })
            */
            return res.success('Usuario registrado correctamente', 200)
          }
        })
      } else {
        return res.failure(-1, 'Ese correo existe, pruebe registrarse con otro', 200)
      }
    })
  } else {
    return res.failure(-1, 'Datos inválidos', 200)
  }
}

/**
 * Inicio de Sesión / Registro Twitter
 */
exports.logInTwitter = (req, res, next) => {
  passport.authenticate('twitter', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.failure(-1, 'Authentication failed', 200)
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      } else {
        if (user.local.roles.indexOf('admin') == -1) {
          res.redirect('/usuario/perfil/'+req.user._id)
        } else {
          res.redirect('/dashboard')
        }
      }
    })
  })(req, res, next)
}

/**
 * Inicio de Sesión / Registro Facebook
 */
exports.logInFacebook = (req, res, next) => {
  passport.authenticate('facebook', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.failure(-1, 'Authentication failed', 200)
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      } else {
        if (user.local.roles.indexOf('admin') == -1) {
          res.redirect('/usuario/perfil/'+req.user._id)
        } else {
          res.redirect('/admin/panel')
        }
      }
    })
  })(req, res, next)
}

/**
 * Inicio de Sesión / Registro LinkedIn
 */
exports.logInLinkedIn = (req, res, next) => {
  passport.authenticate('linkedin', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.failure(-1, 'Authentication failed', 200)
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      } else {
        if (user.local.roles.indexOf('admin') == -1) {
          res.redirect('/usuario/perfil/'+req.user._id)
        } else {
          res.redirect('/admin/panel')
        }
      }
    })
  })(req, res, next)
}

/**
 * Inicio de Sesión / Registro Google
 */
exports.logInGoogle = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.failure(-1, 'Authentication failed', 200)
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      } else {
        if (user.local.roles.indexOf('admin') == -1) {
          res.redirect('/usuario/perfil/'+req.user._id)
        } else {
          res.redirect('/admin/panel')
        }
      }
    })
  })(req, res, next)
}

/**
 * Cerrar de Sesión
 */
exports.logOut = (req, res, next) => {
  req.logout()
  res.redirect('/') // when full api, remove this line
}