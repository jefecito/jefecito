/* jshint esversion: 6 */
var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
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

// =========================================================================
// GOOGLE ==================================================================
// =========================================================================
passport.use(new GoogleStrategy({
  clientID: configAuth.googleAuth.clientID,
  clientSecret: configAuth.googleAuth.clientSecret,
  callbackURL: configAuth.googleAuth.callbackURL,
  scope: [
    'profile',
    'email'
  ]
}, (token, refreshToken, profile, done) => {
  // make the code asynchronous
  // User.findOne won't fire until we have all our data back from Google
  process.nextTick(() => {
    // try to find the user based on their google id
    User.findOne({'google.id': profile.id}, (err, user) => {
      if(err)
        return done(err);
      if(user)
        return done(null, user);
      else {
        var newUser = new User();

        User.findOne({'local.email': profile.emails[0].value}, (err, user) => {
          if(err)
            return res.failure(-1, 'Error social', 200);
          else if(!user) { //usuario local no existe
            var newUser = new User();

            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = profile.emails[0].value;

            newUser.local.createdAt = Date.now();
            newUser.local.roles = ['user'];
            newUser.local.username = profile.displayName;
            newUser.local.email = profile.emails[0].value;
            newUser.local.avatar = profile.photos[0].value;
            newUser.local.creationMethod = 'go';
            newUser.local.isConfirmed = true;

            newUser.save(err => {
              if(err)
                throw err;

              return done(null, newUser);
            });
          } else { //usuario local existe
            user.google.id = profile.id;
            user.google.token = token;
            user.google.name = profile.displayName;
            user.google.email = profile.emails[0].value; // pull the first email

            user.save((err, updatedUser) => {
              if(err)
                throw err;

              return done(null, updatedUser);
            });
          } //else usuario local existe
        }); //findOne
      } //else red social 
    });
  });
}));
