/* jshint esversion: 6 */

/**
 * Variables
 */
const APP = require('./main')

/**
 * Export Auth
 */
module.exports = {
  facebookAuth: {
    clientID: 'client-id-here',
    clientSecret: 'client-secret-here',
    callbackURL: `${APP.getENV().url}/auth/facebook/callback`
  },
  twitterAuth: {
    consumerKey: 'client-id-here',
    consumerSecret: 'client-secret-here',
    callbackURL: `${APP.getENV().url}/auth/twitter/callback`
  },
  googleAuth: {
    clientID: 'client-id-here',
    clientSecret: 'client-secret-here',
    callbackURL: `${APP.getENV().url}/auth/google/callback`
  },
  linkedinAuth: {
    clientID: 'client-id-here',
    clientSecret: 'client-secret-here',
    callbackURL: `${APP.getENV().url}/auth/linkedin/callback`
  }
}