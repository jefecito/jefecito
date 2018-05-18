/* jshint esversion: 6 */

// Modulos
const passport = require('passport')

// auth controller functions
const {
  logInLocal,
  registerLocal,
  logInCallback,
  logOut
} = require('../controllers/authController')

// middlewares
const {
  rateLimiter
} = require('../middlewares/app')

module.exports = application => {
  // Iniciar Sesión Local
  application
    .route('/login')
    .post(rateLimiter, logInLocal)

  // Registrarse Localmente
  application
    .route('/register')
    .post(rateLimiter, registerLocal)

  // Ingresar / Registrarse con Twitter
  application
    .route('/auth/twitter')
    .get(passport.authenticate('twitter'))

  // Ingresar / Registrarse con Facebook
  application
    .route('/auth/facebook')
    .get(passport.authenticate('facebook', {
      scope : 'email'
    }))

  // Ingresar / Registrarse con LinkedIn
  application
    .route('/auth/linkedin')
    .get(passport.authenticate('linkedin'))

  // Ingresar / Registrarse con Google
  application
    .route('/auth/google')
    .get(passport.authenticate('google', {
      scope: [
        'profile',
        'email'
      ]
    }))

  // Callback de Redes Sociales
  application
    .route('/auth/callback/:social')
    .get(logInCallback)

  // Cerrar Sesión
  application
    .route('/logout')
    .get(rateLimiter, logOut)
}