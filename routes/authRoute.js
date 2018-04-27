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

  /**
   * Ingresar/Registrarse con Facebook
   */
  application
    .route('/auth/facebook')
    .get(passport.authenticate('facebook', {
      scope : 'email'
    }))

  /**
   * Ingresar/Registrarse con LinkedIn
   */
  application
    .route('/auth/linkedin')
    .get(passport.authenticate('linkedin'))

  /**
   * Callback de Redes Sociales
   */
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

  /**
   * Cerrar Sesión
   */
  application
    .route('/logout')
    .get(mw.rateLimiter, authController.logOut)
}