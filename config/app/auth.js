/* jshint esversion: 6 */

// Variables
const APP = require('./main')
const URL = APP.getENV().url

// Export Auth
module.exports = {
  // Facebook Credentials
  facebookAuth: {
    clientID: APP.auth.facebook.id,
    clientSecret: APP.auth.facebook.secret,
    callbackURL: `${URL}/auth/callback/facebook`
  },

  // Twitter Credentials
  twitterAuth: {
    consumerKey: APP.auth.twitter.id,
    consumerSecret: APP.auth.twitter.secret,
    callbackURL: `${URL}/auth/callback/twitter`
  },

  // Google Credentials
  googleAuth: {
    clientID: APP.auth.google.id,
    clientSecret: APP.auth.google.secret,
    callbackURL: `${URL}/auth/callback/google`
  },

  // LinkedIn Credentials
  linkedinAuth: {
    clientID: APP.auth.linkedin.id,
    clientSecret: APP.auth.linkedin.secret,
    callbackURL: `${URL}/auth/callback/linkedin`
  }
}