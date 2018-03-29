/* jshint esversion: 6 */

/**
 * Modules
 */
const RateLimiter = require('limiter').RateLimiter
const limiter = new RateLimiter(5, 'second', true)
const jwt = require('jsonwebtoken')

/**
 * APP config
 */
const APP = require('../config/app/main')

module.exports = {
  /**
   * Chequea que haya una sesión válida activa para hacer requests
   */
  requireLogin: (req, res, next) => {
    if (!req.isAuthenticated()) {
      if (req.method == 'GET') {
        return res.redirect('/login')
      } else {
        return res.failure(-1, 'Unauthorized request', 403)
      }
    } else {
      next()
    }
  },

  /**
   * Chequea si el usuario logueado es admin
   */
  isAdmin: (req, res, next) => {
    if (!req.isAuthenticated()) {
      if (req.method == 'GET') {
        return res.redirect('/login')
      } else if (req.method == 'POST') {
        return res.failure(-1, 'Unauthorized', 403)
      }
    } else if (req.user.local.roles.indexOf('admin') == -1) {
      if(req.method == 'GET') {
        return res.redirect('/login')
      } else if (req.method == 'POST') {
        return res.failure(-1, 'Admin access needed', 403)
      }
    } else {
      next()
    }
  },

  /**
   * Limita la cantidad de requests en un período de tiempo
   */
  rateLimiter: (req, res, next) => {
    limiter.removeTokens(1, (err, remainingRequests) => {
      if (remainingRequests < 0) {
        res.writeHead(429, {
          'Content-Type': 'text/plain;charset=UTF-8'
        })
        res.end('Too Many Requests - your IP is being rate limited')
      } else {
        return next()
      }
    })
  },

  /**
   * Middleware to check JWT access
   */
  checkToken: (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token']

    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, APP.jwtSecret, (err, decoded) => {
        if (err) {
          return res.failure(-1, 'Forbidden: Failed to verify token signature', 403)
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded
          next()
        }
      })
    } else {
      return res.failure(-1, 'Forbidden: Token error', 403)
    }
  }
}
