/* jshint esversion: 6 */
var mongoose = require('mongoose'),
    Alerts = require('../models/alerts.js'),
    User = require('../models/users');

/**
 * [Insert alerts to user's alerts array]
 * @param {[type]}   userIds [id or ids of users to update]
 * @param {[type]}   msg     [alert message]
 * @param {Function} cb      [callback]
 */
var setAlert = (userIds, msg, cb) => {
  var newAlert = new Alerts();

  newAlert.date.created = Date.now();
  newAlert.msg = msg;

  newAlert.save((err, a) => {
    if(err)
      cb(err);
    else{
      User.update(
        { _id: { $in: userIds } },
        { $push: {'local.alerts': a._id}
        },(err, users) => {
          if(err)
            cb("Error on Alert");
          else
            cb(null, "User alerted");
        }
      );//findUser
    }//else
  }); //newAlert.save()
};

/**
 * [Get alert array for given userId]
 * @param  {[type]}   userId [userid moongose string]
 * @param  {Function} cb     [callback]
 */
var getAlertsByUserId = (userId, cb) => {
  User
    .findById({_id: userId})
    .populate('local.alerts')
    .exec((err, user) => {
    if(err)
      cb(err);
    else
      cb(null, user.local.alerts);
  });
};

/**
 * [getAlerts get alerts document]
 * @param  {Function} cb [callback]
 */
var getAlerts = (cb) => {
  Alerts.find({}, (err, alerts) => {
    if(err)
      cb(err);
    else
      cb(null, alerts);
  });
};

module.exports = {
  setAlert: setAlert,
  getAlertsByUserId: getAlertsByUserId,
  getAlerts: getAlerts
};