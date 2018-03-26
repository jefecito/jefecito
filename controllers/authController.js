/* jshint esversion: 6 */

/**
 * Requires
 */
const passport = require('passport')

/**
 * Inicio de Sesión Local
 */
exports.logInLocal = (req, res, next) => {
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
 * Inicio de Sesión Twitter
 */
exports.logInTwitter = (req, res, next) => {
  passport.authenticate('twitter', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.failure(-1, 'Authentication failed', 200)
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      } else {
        if (user.local.roles.indexOf('admin') == -1) {
          res.redirect('/usuario/perfil/'+req.user._id)
        } else {
          res.redirect('/dashboard')
        }
      }
    })
  })(req, res, next)
}

/**
 * Inicio de Sesión Facebook
 */
exports.logInFacebook = (req, res, next) => {
  passport.authenticate('facebook', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.failure(-1, 'Authentication failed', 200)
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      } else {
        if (user.local.roles.indexOf('admin') == -1) {
          res.redirect('/usuario/perfil/'+req.user._id)
        } else {
          res.redirect('/admin/panel')
        }
      }
    })
  })(req, res, next)
}

/**
 * Inicio de Sesión LinkedIn
 */
exports.logInLinkedIn = (req, res, next) => {
  passport.authenticate('linkedin', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.failure(-1, 'Authentication failed', 200)
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      } else {
        if (user.local.roles.indexOf('admin') == -1) {
          res.redirect('/usuario/perfil/'+req.user._id)
        } else {
          res.redirect('/admin/panel')
        }
      }
    })
  })(req, res, next)
}

/**
 * Inicio de Sesión Google
 */
exports.logInGoogle = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.failure(-1, 'Authentication failed', 200)
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      } else {
        if (user.local.roles.indexOf('admin') == -1) {
          res.redirect('/usuario/perfil/'+req.user._id)
        } else {
          res.redirect('/admin/panel')
        }
      }
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