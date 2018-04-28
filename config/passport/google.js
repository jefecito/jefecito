/* jshint esversion: 6 */

/**
 * Modules
 */
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const mongoose = require('mongoose')

/**
 * Variables
 */
const AUTH = require('../app/auth')
const CONFIG ={
  clientID: AUTH.googleAuth.clientID,
  clientSecret: AUTH.googleAuth.clientSecret,
  callbackURL: AUTH.googleAuth.callbackURL,
  scope: [
    'profile',
    'email'
  ]
}

/**
 * Models
 */
const User = mongoose.model('User')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

/**
 * Google
 */
passport.use(new GoogleStrategy(CONFIG, (token, refreshToken, profile, done) => {
  process.nextTick(() => {
    let FILTER = {
      'google.id': profile.id
    }

    User
      .findOne(FILTER, (err, user) => {
        if (err) {
          return done(err)
        }

        if (user) {
          return done(null, user)
        } else {
          FILTER = {
            'local.email': profile.emails[0].value
          }

          User
            .findOne(FILTER, (err, user) => {
              if (err) {
                return res.failure(-1, 'Error social', 200)
              } else if (!user) {
                // Usuario local no existe
                const newUser = new User({
                  google: {
                    id: profile.id,
                    token: token,
                    name: profile.displayName,
                    email: profile.emails[0].value
                  },
                  local: {
                    createdAt: Date.now(),
                    roles: [
                      'user'
                    ],
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                    creationMethod: 'go',
                    isConfirmed: true
                  }
                })

                newUser.save(err => {
                  if (err) {
                    throw err
                  }

                  return done(null, newUser)
                })
              } else {
                // Usuario local existe
                if (!user.local.username) {
                  user.local.username = profile.displayName
                }

                if (!user.local.email) {
                  user.local.email = profile.emails[0].value
                }

                user.google = {
                  id: profile.id,
                  token: token,
                  name: profile.displayName,
                  email: profile.emails[0].value // pull the first email
                }

                user.save((err, updatedUser) => {
                  if (err) {
                    throw err
                  }

                  return done(null, updatedUser);
                })
              } // if/else
            }) // User.findOne()
        } // if/else
      }) // User.findOne()
  })
}))
