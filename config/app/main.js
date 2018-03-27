/* jshint esversion: 6 */

/**
 * Requires
 */
const express = require('express')
const nodemailer = require('nodemailer')
const app = express()
const PORT = app.get('port')

/**
 * App Module
 */
module.exports = {
  name: '',
  domain: '',
  url: 'http://',
  dev: {
    url: `http://localhost:${PORT}`
  },
  production:{
    url: 'http://'
  },
  jwtSecret: '',
  getTransporter: () => {
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
  getENV: function () {
    if (process.env.NODE_ENV == 'production') {
      return this.production
    } else {
      return this.dev
    }
  }
}
