/* jshint esversion: 6 */
const bcrypt = require('bcrypt-nodejs')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const validator = require('validator')
const mongoose = require('mongoose')
const User = mongoose.model('User')

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use('local-login', new LocalStrategy((username, password, done) => {
  if(validator.isEmail(username))
    User.findOne({'local.email': username}, (err, user) => {
      if(err)
        return done(err);
      else if(!user)
         return done(null, false, {error: 'error en usuario/contraseña'});
      else if(!bcrypt.compareSync(password, user.local.password))
         return done(null, false, {error: 'error en usuario/Contraseña'});
      else
       return done(null, user);
    }); //findOne
  else
    return done(null, false, {error: 'error en usuario/Contraseña'});
}));