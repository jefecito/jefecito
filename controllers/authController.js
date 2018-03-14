/**
 * Inicio de Sesión
 */
exports.logIn = (req, res, next) => {
  const passport = require('passport')
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      return next(err)
    }
  
    if (!user) {
      return res.failure(-1, 'Correo o contraseña incorrectos', 200)
    }
  
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
  
      return (req.user.local.roles.indexOf('admin') == -1) ?
        res.success({redirect: 'user', user: user}, 200) :
        res.success({redirect: 'dashboard', user: user}, 200)
    })
  })(req, res, next)
}

/**
 * Cerrar de Sesión
 */
exports.logOut = (req, res, next) => {
  req.logout()
  res.redirect('/') // when full api, remove this line
}