/* jshint esversion: 6 */

/**
 * Requires
 */
const appConfig = require('./app')

module.exports = {
  facebookAuth: {
    clientID: 'client-id-here',
    clientSecret: 'client-secret-here',
    callbackURL: `${appConfig.getENV().url}/auth/facebook/callback`
  },
  twitterAuth : {
    consumerKey: 'client-id-here',
    consumerSecret: 'client-secret-here',
    callbackURL: `${appConfig.getENV().url}/auth/twitter/callback`
  },
  googleAuth : {
    clientID: 'client-id-here',
    clientSecret: 'client-secret-here',
    callbackURL: `${appConfig.getENV().url}/auth/google/callback`
  },
  linkedinAuth : {
    clientID: 'client-id-here',
    clientSecret: 'client-secret-here',
    callbackURL: `${appConfig.getENV().url}/auth/linkedin/callback`
  }
}