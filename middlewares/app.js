/* jshint esversion: 6 */

// Modules
const RateLimiter = require('limiter').RateLimiter
const limiter = new RateLimiter(5, 'second', true)
const jwt = require('jsonwebtoken')

// APP config
const APP = require('../config/app/main')

module.exports = {
  // Limita la cantidad de requests en un período de tiempo
  rateLimiter: (req, res, next) => {
    limiter.removeTokens(1, (err, remainingRequests) => {
      if (remainingRequests > 0) {
        return next()
      } else {
        res.writeHead(429, {
          'Content-Type': 'text/plain;charset=UTF-8'
        })
        res.end('Too Many Requests - your IP is being rate limited')
      } // if/else
    }) // limiter.removeTokens
  },

  // Chequea si el usuario logueado es admin
  isAdmin: (req, res, next) => {
    if (req.user.roles.indexOf('admin') === -1) {
      return res.failure(-1, 'Acceso denegado', 403)
    }

    return next()
  },

  // Middleware to check JWT access
  requireAuth: (req, res, next) => {
    const token = req.body.token ||
      req.query.token ||
      req.headers['x-access-token']

    if (!token) {
      return res.failure(-1, 'Token inválido', 403)
    } else {
      jwt.verify(token, APP.jwtSecret, (err, data) => {
        if (err) {
          return res.failure(-1, 'Falla en verificación de Token', 403)
        } else {
          req.user = data
          return next()
        }
      })
    } // if/else
  } // requireAuth
}
