/* jshint esversion: 6 */

/**
 * Requires
 */
const userController = require('../controllers/userController')
const mw = require('../middlewares/app')

module.exports = application => {
  /**
   * Admin APIs:
   * 
   * 
   * GET: Listado de Usuarios
   * POST: Creación de Usuarios
   * DELETE: Eliminación de Usuarios
   */
  application
    .route('/api/users')
    .get(mw.rateLimiter, mw.requireAuth, mw.isAdmin, userController.getAllUsers)
    .delete(mw.rateLimiter, mw.requireAuth, mw.isAdmin, userController.removeUser)

  /**
   * GET: Listado de administradores
   * PUT: Agrega/remueve privilegios de administrador
   */
  application
    .route('/api/admins')
    .get(mw.rateLimiter, mw.requireAuth, mw.isAdmin, userController.getAllAdmins)
    .put(mw.rateLimiter, mw.requireAuth, mw.isAdmin, userController.toggleAdminPriviliges)

  /**
   * User APIs:
   * 
   * 
   * GET: Trae información del usuario
   * PUT: Actualiza nombre de usuario y correo electronico
   */
  application
    .route('/api/user/me')
    .post(mw.rateLimiter, mw.requireAuth, userController.currentUserInfo)
    .put(mw.rateLimiter, mw.requireAuth, userController.updateCurrentUserInfo)

  /**
   * Confirmo Email
   */
  application
    .route('/api/user/confirm')
    .get(mw.rateLimiter, userController.confirmEmail)

  /**
   * Actualizo mi avatar
   */
  application
    .route('/api/user/me/avatar')
    .post(mw.rateLimiter, mw.requireAuth, userController.changeAvatar)

  /**
   * API Contraseñas:
   * 
   * Usuario cambia contraseña
   */
  application
    .route('/api/user/me/change-password')
    .put(mw.rateLimiter, mw.requireAuth, userController.changePassword)

  /**
   * Trae información de un token para resetear contraseña
   */
  application
    .route('/api/user/token')
    .get(mw.rateLimiter, userController.getInfoTokenPassword)

  /**
   * Usuario olvida contraseña
   */
  application
    .route('/api/user/me/request-password')
    .put(mw.rateLimiter, userController.requestPassword)

  /**
   * Usuario cambia su contraseña en base (requestPassowrd)
   */
  application
    .route('/api/user/me/reset-password')
    .put(mw.rateLimiter, userController.resetPassword)
}