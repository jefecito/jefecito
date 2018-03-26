/* jshint esversion: 6 */

/**
 * Requires
 */
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const configAuth = require('./auth')
const mongoose = require('mongoose')
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
 * Facebook
 */
passport.use(new FacebookStrategy({
  clientID: configAuth.facebookAuth.clientID,
  clientSecret: configAuth.facebookAuth.clientSecret,
  callbackURL: configAuth.facebookAuth.callbackURL,
  profileFields: [
    'id',
    'email',
    'gender',
    'photos',
    'link',
    'locale',
    'name',
    'timezone',
    'updated_time',
    'verified'
  ]
}, (token, refreshToken, profile, done) => {
  process.nextTick(() => {
    User.findOne({'facebook.id': profile.id}, (err, user) => {
      if (err) {
        return done(err)
      }

      if (user) {
        // Devuelvo usuario encontrado
        return done(null, user)
      } else {
        const FILTER = {
          'local.email': profile.emails[0].value
        }

        User.findOne(FILTER, (err, user) => {
          if (err) {
            return res.failure(-1, 'Error social', 200)
          } else if(!user) {
            // Usuario local no existe
            const newUser = new User({
              facebook: {
                id: profile.id,
                token: token,
                name: profile.name.givenName + ' ' + profile.name.familyName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
              },
              local: {
                createdAt: Date.now(),
                roles: ['user'],
                username: profile.name.givenName + ' ' + profile.name.familyName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                creationMethod: 'fb',
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
            user.facebook = {
              id: profile.id,
              token: token,
              name: profile.name.givenName + ' ' + profile.name.familyName,
              email: profile.emails[0].value,
              avatar: profile.photos[0].value
            }

            user.save((err, updatedUser) => {
              if (err) {
                throw err
              }

              return done(null, updatedUser)
            })
          }
        })
      } // if/else
    }) // User.findOne()
  })
}))