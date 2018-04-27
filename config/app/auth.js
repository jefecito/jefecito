/* jshint esversion: 6 */

/**
 * Variables
 */
const APP = require('./main')
const URL = APP.getENV().url  //'http://localhost:8080'

/**
 * Export Auth
 */
module.exports = {
  /**
   * Facebook Credentials
   */
  facebookAuth: {
    clientID: 'client-id-here',
    clientSecret: 'client-secret-here',
    callbackURL: `${URL}/auth/facebook/callback`
  },
  /**
   * Twitter Credentials
   */
  twitterAuth: {
    consumerKey: 'client-id-here',
    consumerSecret: 'client-secret-here',
    callbackURL: `${URL}/auth/twitter/callback`
  },
  /**
   * Google Credentials
   */
  googleAuth: {
    clientID: 'client-id-here',
    clientSecret: 'client-secret-here',
    callbackURL: `${URL}/auth/google/callback`
  },
  /**
   * LinkedIn Credentials
   */
  linkedinAuth: {
    clientID: 'client-id-here',
    clientSecret: 'client-secret-here',
    callbackURL: `${URL}/auth/linkedin/callback`
  }
}