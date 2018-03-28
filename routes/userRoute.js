/* jshint esversion: 6 */

/*
 * Requires
 */
const userController = require('../controllers/userController')
const mw = require('../middlewares/app')

module.exports = application => {
  /*
   * Acciones de usuario.
   * GET: Trae todos los usuarios o especifico segun ID
   * DELETE: Elimina usuario especifico por ID
   */
  application
    .route('/api/users')
    .get(mw.rateLimiter, mw.isAdmin, userController.getAllUsers)
    .post(mw.rateLimiter, mw.isAdmin, userController.createUser)
    .delete(mw.rateLimiter, mw.isAdmin, userController.removeUser)

  /*
   * Actualiza email y nombre de usuario
   */
  application
    .route('/api/user/update')
    .put(mw.requireLogin, userController.updateEmailUsername)

  /*
   * Agrega/remueve privilegios de administrador
   * Posible extención a multiples roles
   */
  application
    .route('/api/user/upgrade')
    .put(mw.rateLimiter, mw.isAdmin, userController.toggleAdminPriviliges)
}