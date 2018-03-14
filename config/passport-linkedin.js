/* jshint esversion: 6 */
const passport = require('passport')
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const configAuth = require('./auth')
const mongoose = require('mongoose')
const User = mongoose.model('User')

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// =========================================================================
// LINKEDIN ================================================================
// =========================================================================
passport.use(new LinkedInStrategy({
  clientID: configAuth.linkedinAuth.clientID,
  clientSecret: configAuth.linkedinAuth.clientSecret,
  callbackURL: configAuth.linkedinAuth.callbackURL,
  scope: [
    'r_emailaddress',
    'r_basicprofile'
  ],
  state: true
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => {
    User.findOne({'linkedin.id': profile.id }, (err, user) => {
      if(err)
        return done(err);
      if(user)
        return done(null, user);
      else {
        User.findOne({'local.email': profile.emails[0].value}, (err, user) => {
          if(err)
            return res.failure(-1, 'Error social', 200);
          else if(!user) {
            var newUser = new User();

            newUser.linkedin.id = profile.id; 
            newUser.linkedin.token = accessToken;
            newUser.linkedin.name = profile.displayName;
            newUser.linkedin.email = profile.emails[0].value;
            newUser.linkedin.avatar = profile.photos[0].value;
            
            newUser.local.createdAt = Date.now();
            newUser.local.roles = ['user'];
            newUser.local.username = profile.displayName;
            newUser.local.email = profile.emails[0].value;
            newUser.local.avatar = profile.photos[0].value;
            newUser.local.bio = profile._json.summary;
            newUser.local.creationMethod = 'li';
            newUser.local.isConfirmed = true;
            
            newUser.save(err => {
              if(err)
                throw err;
              return done(null, newUser);
            });
          } else { //usuario local ya existe
            user.linkedin.id = profile.id; 
            user.linkedin.token = accessToken;
            user.linkedin.name = profile.displayName;
            user.linkedin.email = profile.emails[0].value;
            user.linkedin.avatar = profile.photos[0].value;
            user.local.bio = profile._json.summary;

            user.save((err, updatedUser) => {
              if(err)
                throw err;

              return done(null, updatedUser);
            });
          }
        });
      } //social no existe
    });
  });
}));