/* jshint esversion: 6 */

/**
 * Modules
 */
const express = require('express')
const nodemailer = require('nodemailer')

/**
 * Variables
 */
const CONFIG = require('./config')

/**
 * App Module
 */
module.exports = {
  name: CONFIG.appName,
  domain: CONFIG.appURL,
  port: CONFIG.port,
  url: 'http://',
  dev: {
    url: `http://localhost:${CONFIG.port}`
  },
  production: {
    url: 'http://'
  },
  jwtSecret: 'j3f3c1t0_jwtS3cr3t',
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
