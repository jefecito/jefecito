/* jshint esversion: 6 */
var nodemailer = require('nodemailer');

module.exports = {
  name: '',
  domain: '',
  url: 'http://',
  dev: {
    url: 'http://localhost:3000'
  },
  production:{
    url: 'http://'
  },
  jwtSecret: '',
  getTransporter: () => {
    var t = nodemailer.createTransport({
      host: '',
      port: 465,
      secure: true,
      auth: {
        user: '',
        pass: ''
      }
    });
    return t;
  },
  getENV: function(){
    if(process.env.NODE_ENV == 'production')
      return this.production;
    else
      return this.dev;
  }
};
