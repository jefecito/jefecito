/* jshint esversion: 6 */

/**
 * Modules
 */
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy
const mongoose = require('mongoose')

/**
 * Variables
 */
const AUTH = require('../app/auth')
const CONFIG = {
  consumerKey: AUTH.twitterAuth.consumerKey,
  consumerSecret: AUTH.twitterAuth.consumerSecret,
  callbackURL: AUTH.twitterAuth.callbackURL
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
 * Twitter
 */
passport.use(new TwitterStrategy(CONFIG, (token, tokenSecret, profile, done) => {
  process.nextTick(() => {
    let FILTER = {
      'twitter.id': profile.id
    }

    User
      .findOne(FILTER, (err, user) => {
        if (err) {
          return done(err)
        }

        if (user) {
          return done(null, user)
        } else {
          const newUser = new User({
            twitter: {
              id: profile.id,
              token: token,
              username: profile.displayName,
              avatar: profile._json.profile_image_url_https
            },
            local: {
              createdAt: Date.now(),
              roles: ['user'],
              username: profile.displayName,
              avatar: profile._json.profile_image_url_https,
              creationMethod: 'tw',
              isConfirmed: true
            }
          })

          newUser
            .save(err => {
              if (err) {
                throw err
              } else {
                return done(null, newUser)
              } // iif/else
            }) // newUser.save()
        } // if/else
      }) // User.findOne()
  })
}))

