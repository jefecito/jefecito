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
  auth: {
    facebook: {
      id: CONFIG.social.facebook.id,
      secret: CONFIG.social.facebook.secret
    },
    google: {
      id: CONFIG.social.google.id,
      secret: CONFIG.social.google.secret
    },
    linkedin: {
      id: CONFIG.social.linkedin.id,
      secret: CONFIG.social.linkedin.secret
    },
    twitter: {
      id: CONFIG.social.twitter.id,
      secret: CONFIG.social.twitter.secret
    }
  },
  url: 'http://',
  dev: {
    url: `http://localhost:${CONFIG.port}`
  },
  production: {
    url: 'http://'
  },
  jwtSecret: 'j3f3c1t0_jwtS3cr3t',
  getTransporter () {
    let t
    /**
     * Service GMAIL, etc:
     */
    t = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '',
        pass: ''
      }
    })
    /**
     * Own Host (remove comment)
     */
    /*
      t = nodemailer.createTransport({
        host: '',
        port: 465,
        secure: true,
        auth: {
          user: '',
          pass: ''
        }
      })
    */
    return t
  },
  getENV () {
    if (process.env.NODE_ENV == 'production') {
      return this.production
    } else {
      return this.dev
    }
  }
}
