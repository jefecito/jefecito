/* jshint esversion: 6 */

// REQUIREs
// ==============================================
// ==============================================
const express   = require('express')
const mongoose  = require('mongoose')
const router    = express.Router()
const User      = mongoose.model('User')
const mw        = require('../middlewares/app')
const appConfig = require('../config/app/config')

// API USUARIOS
// ==============================================
// ==============================================
  // Traer Alertas User
  // ==============================================
  router.get('/userAlerts', /*mw.requireAuth,*/ (req, res) => {
    User
      .findById({_id: req.user._id})
      .populate('local.alerts')
      .exec(function(err, user) {
        return (err) ?
          res.failure(-1, err, 200) :
          res.success(user.local.alerts, 200);
      }); // exec()
  }); // GET /userAlerts

// USUARIOS RENDER VISTAS
// ==============================================
// ==============================================
  router.get('/', (req, res) => {
    res.render('index', {
      app: appConfig
    });
  }); // GET /

  router.get('/user', /*mw.requireAuth,*/ (req, res) => {
    res.render('user', {
      app: appConfig,
      user: req.user
    });
  }); // GET /user

  router.get('/user/settings', /*mw.requireAuth,*/ (req, res) => {
    res.render('user-settings', {
      app: appConfig,
      user: req.user
    });
  }); // GET /user/settings

  router.get('/user/config', /*mw.requireAuth,*/ (req, res) => {
    res.render('user-config', {
      app: appConfig,
      user: req.user
    });
  }); // GET /user/config

  router.get('/dashboard', mw.isAdmin, (req, res) => {
    res.render('dashboard', {
      app: appConfig
    });
  }); // GET /dashboard

  router.get('/dashboard/users', mw.isAdmin, (req, res) => {
    res.render('all-users', {
      app: appConfig,
      user_id: req.user._id
    });
  }); // GET /dashboard/users

  router.get('/dashboard/admins', mw.isAdmin, (req, res) => {
    res.render('all-admins', {
      app: appConfig,
      user_id: req.user._id
    });
  }); // GET /dashboard/admins

  router.get('/dashboard/documents', mw.isAdmin, (req, res) => {
    res.render('all-documents', {
      app: appConfig
    });
  }); // GET /dashboard/documents

module.exports = router;