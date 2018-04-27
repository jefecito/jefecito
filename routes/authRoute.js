/* jshint esversion: 6 */

/**
 * Requires
 */
const authController = require('../controllers/authController')
const passport = require('passport')
const mw = require('../middlewares/app')

module.exports = application => {
  /**
   * Iniciar Sesión Local
   */
  application
    .route('/login')
    .post(mw.rateLimiter, authController.logInLocal)

  /**
   * Registrarse Localmente
   */
  application
    .route('/register')
    .post(mw.rateLimiter, authController.registerLocal)

  /**
   * Ingresar/Registrarse con Twitter
   */
  application
    .route('/auth/twitter')
    .get(passport.authenticate('twitter'))

  application
    .route('/auth/twitter/callback')
    .get(authController.logInTwitter)

  /**
   * Ingresar/Registrarse con Facebook
   */
  application
    .route('/auth/facebook')
    .get(passport.authenticate('facebook', {
      scope : 'email'
    }))

  application
    .route('/auth/facebook/callback')
    .get(authController.logInFacebook)

  /**
   * Ingresar/Registrarse con LinkedIn
   */
  application
    .route('/auth/linkedin')
    .get(passport.authenticate('linkedin'))

  application
    .route('/auth/linkedin/callback')
    .get(authController.logInLinkedIn)


  application
    .route('/auth/callback/:social')
    .get(authController.logInCallback)

  /**
   * Ingresar/Registrarse con Google
   */
  application
    .route('/auth/google')
    .get(passport.authenticate('google', {
      scope: [
        'profile',
        'email'
      ]
    }))

  application
    .route('/auth/google/callback')
    .get(authController.logInGoogle)

  /**
   * Cerrar Sesión
   */
  application
    .route('/logout')
    .get(mw.rateLimiter, authController.logOut)
}