/* jshint esversion: 6 */

// user controller functions
const {
  getAllUsers,
  removeUser
} = require('../controllers/userController')

// middlewares
const {
  rateLimiter,
  requireAuth,
  isAdmin,
  getAllAdmins,
  toggleAdminPriviliges,
  currentUserInfo,
  updateCurrentUserInfo,
  confirmEmail,
  changeAvatar,
  changePassword,
  getInfoTokenPassword,
  requestPassword,
  resetPassword
} = require('../middlewares/app')

module.exports = application => {
  // Admin APIs:

  // GET: Listado de Usuarios
  // POST: Creación de Usuarios
  // DELETE: Eliminación de Usuarios
  application
    .route('/api/users')
    .get(rateLimiter, requireAuth, isAdmin, getAllUsers)
    .delete(rateLimiter, requireAuth, isAdmin, removeUser)

  // GET: Listado de administradores
  // PUT: Agrega/remueve privilegios de administrador
  application
    .route('/api/admins')
    .get(rateLimiter, requireAuth, isAdmin, getAllAdmins)
    .put(rateLimiter, requireAuth, isAdmin, toggleAdminPriviliges)


  // User APIs:

  // GET: Trae información del usuario
  // PUT: Actualiza nombre de usuario y correo electronico
  application
    .route('/api/user/me')
    .post(rateLimiter, requireAuth, currentUserInfo)
    .put(rateLimiter, requireAuth, updateCurrentUserInfo)

  // Confirmo Email
  application
    .route('/api/user/confirm')
    .get(rateLimiter, confirmEmail)

  // Actualizo mi avatar
  application
    .route('/api/user/me/avatar')
    .post(rateLimiter, requireAuth, changeAvatar)

  // Usuario cambia contraseña
  application
    .route('/api/user/me/change-password')
    .put(rateLimiter, requireAuth, changePassword)

  // Trae información de un token para resetear contraseña
  application
    .route('/api/user/token')
    .get(rateLimiter, getInfoTokenPassword)

  // Usuario olvida contraseña
  application
    .route('/api/user/me/request-password')
    .put(rateLimiter, requestPassword)

  // Usuario cambia su contraseña en base (requestPassowrd)
  application
    .route('/api/user/me/reset-password')
    .put(rateLimiter, resetPassword)
}