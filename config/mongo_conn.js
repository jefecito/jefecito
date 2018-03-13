// require
const mongoose = require('mongoose')
const colors = require('colors')
const cfg = require('./config.json')

// require models
require('./models/alerts')
require('./models/uplodas')
require('./models/users')

const User = mongoose.model('User')

// mongoose.connect database
mongoose.connect(`mongodb://127.0.0.1/${cfg.appName}`, err => {
  if(err)
    console.log((`[+] MongoDB ${err}`).red);
  else {
    console.log('[+] Connected to MongoDB'.green);
    console.log(`[+] DB: ${cfg.appName}`);
  }
});

User.findOne({'local.creationMethod': 'superadmin'}, (err, doc) => {
  if(err)
    console.log('err', err);
  else {
    if(!doc) {
      var newUser = new User();

      newUser.local.createdAt = Date.now();
      newUser.local.username = 'admin';
      newUser.local.email = 'admin@'+cfg.appURL;
      newUser.local.password = newUser.generateHash('cr4fty_p4ssw0rd!');
      newUser.local.roles = ['admin'];
      newUser.local.isConfirmed = true;
      newUser.local.creationMethod = 'superadmin';

      newUser.save(err => {
        if(err)
          console.log('err creating admin user', err);
        else {
          console.log('');
          console.log('======================');
          console.log('Admin user created');
          console.log('User: admin');
          console.log('Email: ', 'admin@'+cfg.appURL);
          console.log('Password:', 'Admin_'+cfg.appName);
          console.log('======================');
          console.log('');
        }
      });
    }
  }
});