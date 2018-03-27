/* jshint esversion: 6 */

/**
 * Requires
 */
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const validator = require('validator')
const mongoose = require('mongoose')
const User = mongoose.model('User')

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

/**
 * Local
 */
passport.use('local-login', new LocalStrategy((username, password, done) => {
  if(validator.isEmail(username)) {
    const FILTER = {
      'local.email': username
    }

    User.findOne(FILTER, (err, user) => {
      if (err) {
        return done(err)
      } else if (!user) {
        return done(null, false, {
          error: 'error en usuario/contraseña'
        })
      } else if (!user.validPassword(password, user.local.password)) {
        return done(null, false, {
          error: 'Usuario o contraseñ incorrecta'
        })
      } else {
        return done(null, user)
      }
    })
  } else {
    return done(null, false, {
      error: 'error en usuario/Contraseña'
    })
  }
}))