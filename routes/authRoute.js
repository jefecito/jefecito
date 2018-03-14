/* jshint esversion: 6 */

module.exports = application => {
  const authController = require('../controllers/authController')
  const mw = require('../middlewares/app')

  application
    .route('/login')
    .post(mw.rateLimiter, authController.logIn)

  application
    .route('/logout')
    .get(mw.rateLimiter, authController.logOut)
}