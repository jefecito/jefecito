/* jshint esversion: 6 */

/**
 * Modules
 */
const passport = require('passport')
const validator = require('validator')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const EmailTemplate = require('email-templates-v2').EmailTemplate
const path = require('path')

/**
 * Models
 */
const User = mongoose.model('User')

/**
 * APP cfg
 */
const APP = require('../config/app/main')
const transporter = APP.getTransporter()

/**
 * Export Email Templates
 */
const confirmEmail = new EmailTemplate(
  path.join(
    __dirname,
    '../templates',
    'confirmemail'
  )
)

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
      } else {
        const payload = generatePayload(user)
        return res.success(payload)
      } // if/else
    })
  })(req, res, next)
}

/**
 * Registro Local
 */
exports.registerLocal = (req, res, next) => {
  const {
    password,
    rePassword,
    email
  } = req.body

  if (!validator.isEmail(email)) {
    return res.failure(-1, 'Debe ingresar un email válido', 200)
  } else if (password.length < 7) {
    return res.failure(-1, 'La contraseña debe ser mayor a 7 caracteres', 200)
  } else if (password !== rePassword) {
    return res.failure(-1, 'La contraseña deben coincidir', 200)
  } else {
    const FILTER = {
      'local.email': email
    }
  
    User
      .findOne(FILTER, (err, user) => {
        if (err) {
          return res.failure(-1, err, 200);
        } else if (!user) {
          let newUser = new User({
            local: {
              createdAt: Date.now(),
              email,
              roles: [
                'user'
              ],
              creationMethod: 'local',
              isConfirmed: false
            }
          })
  
          newUser.local.password = newUser.generateHash(password)
  
          newUser.save((err, data) => {
            if (err) {
              return res.failure(-1, err, 200)
            } else {
              let info = {
                app: {
                  name: APP.name,
                  url: APP.getENV().url,
                  clientURI: `http://localhost:8080`
                },
                email: data.local.email,
                id: data._id
              }

              confirmEmail
                .render(info, (err, result) => {
                  if(err) {
                    console.log(err);
                  } else {
                    var mailOptions = {
                      from: 'info@jefecito.io',
                      to: [
                        email
                      ],
                      subject: `Bienvenido ${data.local.email} a ${APP.name}`,
                      html: result.html
                    }
      
                    transporter
                      .sendMail(mailOptions, (error, info) => {
                        if (error) {
                          console.log(error)
                        } else {
                          console.log('Message sent: ' + info.response)
                        }
                      })
                  }
                })

              return res.success(`Se ha enviado un correo electrónico a ${data.local.email} para confirmar la cuenta`, 200)
            }
          })
        } else {
          return res.failure(-1, 'Ese correo existe, pruebe registrarse con otro', 200)
        }
      })
  }
}

/**
 * Auth Callback Social
 */
exports.logInCallback = (req, res, next) => {
  passport.authenticate(req.params.social, (err, user, info) => {
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
        const payload = generatePayload(user)
        res.writeHead(302, {
          Location: `http://localhost:8080/auth/callback?token=${payload.token}`
        })
        res.end()
      } // if/else
    })
  })(req, res, next)
}

/**
 * Cerrar de Sesión
 */
exports.logOut = (req, res, next) => {
  req.logout()
  return res.success('Sesión cerrada', 200)
}

/**
 * Funciones Auxiliares
 * 
 * Generar Payload
 */
function generatePayload (user) {
  const tokenConfig = {
    id: user._id,
    email: user.local.email,
    roles: user.local.roles
  }
  
  const tokenExpires = {
    expiresIn: '10h'
  }

  return {
    id: user._id,
    username: user.local.username,
    email: user.local.email,
    roles: user.local.roles,
    avatar: `${APP.getENV().url}${user.local.avatar}`,
    token: jwt.sign(
      tokenConfig,
      APP.jwtSecret,
      tokenExpires
    )
  }
} // generatePayload()