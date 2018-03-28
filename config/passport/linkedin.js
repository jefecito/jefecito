/* jshint esversion: 6 */

/**
 * Requires
 */
const passport = require('passport')
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const mongoose = require('mongoose')

/**
 * Variables
 */
const AUTH = require('../app/auth')

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
 * LinkedIn
 */
passport.use(new LinkedInStrategy({
  clientID: AUTH.linkedinAuth.clientID,
  clientSecret: AUTH.linkedinAuth.clientSecret,
  callbackURL: AUTH.linkedinAuth.callbackURL,
  scope: [
    'r_emailaddress',
    'r_basicprofile'
  ],
  state: true
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => {
    let FILTER = {
      'linkedin.id': profile.id
    }

    User.findOne(FILTER, (err, user) => {
      if (err) {
        return done(err)
      }

      if (user) {
        return done(null, user)
      } else {
        FILTER = {
          'local.email': profile.emails[0].value
        }

        User.findOne(FILTER, (err, user) => {
          if (err) {
            return res.failure(-1, 'Error social', 200)
          } else if(!user) {
            const newUser = new User({
              linkedin: {
                id: profile.id,
                token: accessToken,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value
              },
              local: {
                createdAt: Date.now(),
                roles: ['user'],
                username: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                bio: profile._json.summary,
                creationMethod: 'li',
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
            // Usuario local ya existe
            user.linkedin = {
              id: profile.id,
              token: accessToken,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0].value,
            }

            user.local.bio = profile._json.summary

            user.save((err, updatedUser) => {
              if (err) {
                throw err
              }

              return done(null, updatedUser);
            })
          } // if/else
        })
      } // if/else
    }) // User.findOne()
  })
}))