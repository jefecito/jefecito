/* jshint esversion: 6 */

// Modules
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const validator = require('validator')
const mongoose = require('mongoose')

// Models
const User = mongoose.model('User')

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

// Local
passport.use('local-login', new LocalStrategy((username, password, done) => {
  if (!validator.isEmail(username)) {
    return done(null, false, {
      error: 'Correo electrónico no válido'
    })
  } else {
    const FILTER = {
      'local.email': username
    }

    User
      .findOne(FILTER, (err, user) => {
        if (err) {
          return done(err)
        } else if (!user) {
          return done(null, false, {
            error: 'Error en usuario/contraseña'
          })
        } else if (!user.validPassword(password, user.local.password)) {
          return done(null, false, {
            error: 'Usuario o contraseña incorrecta'
          })
        } else {
          return done(null, user)
        } // if/else
      }) // User.findOne()
  } // if/else
}))