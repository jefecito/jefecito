/* jshint esversion: 6 */
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
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
// FACEBOOK ================================================================
// =========================================================================
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
      if(err)
        return done(err);
      if(user)
        return done(null, user); // user found, return that user
      else {
        User.findOne({'local.email': profile.emails[0].value}, (err, user) => {
          if(err)
            return res.failure(-1, 'Error social', 200);
          else if(!user) { //usuario local no existe
            var newUser = new User();

            newUser.facebook.id = profile.id; 
            newUser.facebook.token = token;                
            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
            newUser.facebook.email = profile.emails[0].value;
            newUser.facebook.avatar = profile.photos[0].value;
            
            newUser.local.createdAt = Date.now();
            newUser.local.roles = ['user'];
            newUser.local.username = profile.name.givenName + ' ' + profile.name.familyName;
            newUser.local.email = profile.emails[0].value;
            newUser.local.avatar = profile.photos[0].value;
            newUser.local.creationMethod = 'fb';
            newUser.local.isConfirmed = true;
            
            newUser.save(err => {
              if(err)
                throw err;

              return done(null, newUser);
            });
          } else { //usuario local ya existe
            user.facebook.id = profile.id; 
            user.facebook.token = token;
            user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
            user.facebook.email = profile.emails[0].value;
            user.facebook.avatar = profile.photos[0].value;

            user.save((err, updatedUser) => {
              if(err)
                throw err;

              return done(null, updatedUser);
            });
          }
        });
      } //else social no existe
    }); //findOne facebook.id
  });
}));