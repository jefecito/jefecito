/* jshint esversion: 6 */

/**
 * Requires
 */
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy
const configAuth = require('../app/auth')
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
 * Twitter
 */
passport.use(new TwitterStrategy({
  consumerKey: configAuth.twitterAuth.consumerKey,
  consumerSecret: configAuth.twitterAuth.consumerSecret,
  callbackURL: configAuth.twitterAuth.callbackURL
}, (token, tokenSecret, profile, done) => {
  process.nextTick(() => {
    let FILTER = {
      'twitter.id': profile.id
    }

    User.findOne(FILTER, (err, user) => {
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

        newUser.save(err => {
          if (err) {
            throw err
          }

          return done(null, newUser);
        })
      }
    })
  })
}))

