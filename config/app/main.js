/* jshint esversion: 6 */

/**
 * Requires
 */
const express = require('express')
const nodemailer = require('nodemailer')
const PORT = express().get('port')
const CONFIG = require('./config')

/**
 * App Module
 */
module.exports = {
  name: CONFIG.appName,
  domain: CONFIG.appURL,
  url: 'http://',
  dev: {
    url: `http://localhost:${PORT}`
  },
  production: {
    url: 'http://'
  },
  jwtSecret: '',
  getTransporter () {
    return nodemailer.createTransport({
      host: '',
      port: 465,
      secure: true,
      auth: {
        user: '',
        pass: ''
      }
    })
  },
  getENV () {
    if (process.env.NODE_ENV == 'production') {
      return this.production
    } else {
      return this.dev
    }
  }
}
