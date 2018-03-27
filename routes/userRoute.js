/* jshint esversion: 6 */

module.exports = application => {
  const userController = require('../controllers/userController')
  const mw = require('../middlewares/app')

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
}