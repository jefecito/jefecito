/* jshint esversion: 6 */

/**
 * Requires
 */
const mongoose = require('mongoose')
const colors = require('colors')
const cfg = require('./config.json')

/**
 * Import Models
 */
require('../models/userModel')
require('../models/alertModel')
require('../models/uploadModel')

/**
 * Connect mongoose database
 */
mongoose.connect(`mongodb://127.0.0.1/${cfg.appName}`, err => {
  if(err)
    console.log((`[+] MongoDB ${err}`).red)
  else {
    console.log('[+] Connected to MongoDB'.green)
    console.log(`[+] DB: ${cfg.appName}`)
  }
})

/**
 * Create superadmin user
 */
const User = mongoose.model('User')
const FILTER = {
  'local.creationMethod': 'superadmin'
}

User.findOne(FILTER, (err, user) => {
  if(err)
    console.log('err', err);
  else {
    if(!user) {
      let newUser = new User({
        local: {
          createdAt: Date.now(),
          username: 'admin',
          email: `admin@${cfg.appURL}`,
          roles: ['admin'],
          isConfirmed: true,
          creationMethod: 'superadmin'
        }
      })
      
      newUser.password = newUser.generateHash('cr4fty_p4ssw0rd!')

      newUser.save(err => {
        if(err)
          console.log('err creating admin user', err)
        else {
          console.log('')
          console.log('======================')
          console.log('Admin user created')
          console.log('User: admin')
          console.log('Email: ', `admin@${cfg.appURL}`)
          console.log('Password:', 'cr4fty_p4ssw0rd')
          console.log('======================')
          console.log('')
        }
      })
    }
  }
})