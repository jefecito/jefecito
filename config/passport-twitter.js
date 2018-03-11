/* jshint esversion: 6 */
var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    User = require('../models/users'),
    configAuth = require('./auth');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
  
passport.use(new TwitterStrategy({
  consumerKey: configAuth.twitterAuth.consumerKey,
  consumerSecret: configAuth.twitterAuth.consumerSecret,
  callbackURL: configAuth.twitterAuth.callbackURL
}, (token, tokenSecret, profile, done) => {
  process.nextTick(() => {
    User.findOne({'twitter.id': profile.id}, (err, user) => {
      if(err)
        return done(err);
      if(user)
        return done(null, user); 
      else {
        var newUser = new User();

        newUser.twitter.id = profile.id;
        newUser.twitter.token = token;
        newUser.twitter.username = profile.displayName;
        newUser.twitter.avatar = profile._json.profile_image_url_https;

        newUser.local.createdAt = Date.now();
        newUser.local.roles = ['user'];
        newUser.local.username = profile.displayName;
        newUser.local.avatar = profile._json.profile_image_url_https;
        newUser.local.creationMethod = 'tw';
        newUser.local.isConfirmed = true;

        newUser.save(err => {
          if(err)
            throw err;

          return done(null, newUser);
        });
      }
    });
  });
}));

