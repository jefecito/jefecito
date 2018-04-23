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
   * CRD de usuario
   */
  application
    .route('/api/users')
    .get(mw.rateLimiter, mw.requireAuth, mw.isAdmin, userController.getAllUsers)
    .post(mw.rateLimiter, mw.requireAuth, mw.isAdmin, userController.createUser)
    .delete(mw.rateLimiter, mw.requireAuth, mw.isAdmin, userController.removeUser)

  /**
   * Agrega/remueve privilegios de administrador
   * Posible extención a multiples roles
   */
  application
    .route('/api/user/upgrade')
    .put(mw.rateLimiter, mw.requireAuth, mw.isAdmin, userController.toggleAdminPriviliges)

  /**
   * Trae todos los administradores
   */
  application
    .route('/api/admins')
    .get(mw.rateLimiter, mw.requireAuth, mw.isAdmin, userController.getAllAdmins)

  /**
   * User APIs:
   * 
   * Actualiza email y nombre de usuario
   */
  application
    .route('/api/user/update')
    .put(mw.rateLimiter, mw.requireAuth, userController.updateEmailUsername)

  /**
   * GET: Trae información del usuario
   * PUT: Actualiza nombre de usuario y correo electronico
   * 
   */
  application
    .route('/api/user/me')
    .get(mw.requireAuth, userController.currentUserInfo)
    .put(mw.rateLimiter, mw.requireAuth, userController.updateCurrentUserInfo)

  /**
   * Cambiar contraseña
   */
  application
    .route('/api/user/me/change-password')
    .put(mw.rateLimiter, mw.requireAuth, userController.changePassword)
  
  /**
   * Actualizo mi avatar
   */
  application
    .route('/api/user/me/avatar')
    .post(mw.rateLimiter, mw.requireAuth, userController.changeAvatar)
}