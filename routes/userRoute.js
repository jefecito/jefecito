/* jshint esversion: 6 */

/**
 * Requires
 */
const userController = require('../controllers/userController')
const mw = require('../middlewares/app')

module.exports = application => {
  /**
   * Acciones de usuario
   */
  application
    .route('/api/users')
    .get(mw.rateLimiter, mw.isAdmin, userController.getAllUsers)
    .post(mw.rateLimiter, mw.isAdmin, userController.createUser)
    .delete(mw.rateLimiter, mw.isAdmin, userController.removeUser)

  /**
   * Actualiza email y nombre de usuario
   */
  application
    .route('/api/user/update')
    .put(mw.requireLogin, userController.updateEmailUsername)

  /**
   * Agrega/remueve privilegios de administrador
   * Posible extención a multiples roles
   */
  application
    .route('/api/user/upgrade')
    .put(mw.rateLimiter, mw.isAdmin, userController.toggleAdminPriviliges)

  /**
   * Acciones usuario registrado
   */
  application
    .route('/api/user/me')
    .get(mw.requireLogin, userController.currentUserInfo)
    .put(mw.rateLimiter, mw.requireLogin, userController.updateCurrentUserInfo)

  //application
    //.route('/api/user/me/change-password')
    //.put(mw.rateLimit, mw.requireLogin, userController.changePassword)
  
  /**
   * Actualizo mi avatar
   */
  application
    .route('/api/user/me/avatar')
    .post(mw.rateLimiter, mw.requireLogin, userController.changeAvatar)
}