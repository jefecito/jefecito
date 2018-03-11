/* jshint esversion: 6 */
var nodemailer = require('nodemailer');

module.exports = {
   sendConfig: () => {
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
   }
};