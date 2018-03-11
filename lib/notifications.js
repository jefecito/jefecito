/* jshint esversion: 6 */
var express = require('express'),
    passport = require('passport'),
    router = express.Router(),
    User = require('../models/users'),
    mongoose = require('mongoose');

/* Crea una notificación para un usuario en particular */
var set = (userId, msg, callback) => {
  var filter;
  if(userId !== undefined)
    filter = {_id: userId};
  else
    callback('Parámetros Insuficientes');

  User.findByIdAndUpdate(filter, {
    $push: {
      'local.notifications':{
        msg: msg,
        dateCreated: Date.now()
      }
    }
  }, {new: true}, (err, data) => {
    if(err)
      callback(err);
    else
      callback(null, data);
  });
};

/* Notificación vista */
var view = (userId, notificationId, callback) => {
  var filter;
  if(userId !== undefined)
    filter = {_id: userId, 'local.notifications._id': notificationId};
  else
    callback("Parámetros Insuficientes");

  User.findOneAndUpdate(filter, {
    $set: {
      'local.notifications.$.viewed': true
    }
  }, {new: true}, (err, d) => {
    if(err)
      callback(err);
    else
      callback(null, d);
  });
};

var get = (userId, callback) => {
  var filter;
  if(userId !== undefined)
    filter = {_id: userId};
  else
    callback("Parámetros Insuficientes");

  User.findById(filter, (err, user) => {
    if(err)
      callback(err);
    else
      callback(null, user.local.notifications);
  });
};


module.exports = {
  Set: set,
  View: view,
  Get: get
};