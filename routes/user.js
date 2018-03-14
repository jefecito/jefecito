/* jshint esversion: 6 */

// REQUIREs
// ==============================================
// ==============================================
const express   = require('express')
const passport  = require('passport')
const router    = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Upload = mongoose.model('Upload')
const Alert     = mongoose.model('Alert')
const mw        = require('../middlewares/app')
const multer    = require('multer')
const validator = require('validator')
const fs        = require('fs')
const mkdirp    = require('mkdirp')
const crypto    = require('crypto')
const appConfig = require('../config/config')
const utils     = require('../lib/utils')





// API USUARIOS
// ==============================================
// ==============================================
  // Cambia el avatar
  // ==============================================
  router.post('/profile/avatar/upload', mw.requireLogin, (req, res) => {
    var clean_path = 'uploads/' + req.user._id + '/avatar/';

    mkdirp('public/uploads/' + req.user._id + '/avatar/', (err) => { 
      var storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'public/uploads/' + req.user._id +'/avatar');
        }, // destination
        filename: (req, file, cb) => {
          cb(null, 'avatar');
        } // filename
      }); // multer.diskStorage()

      var uploadAvatar = multer({
        storage: storage,
        limits: {
          fileSize: 10000000, files:1
        }
      }).single('avatar');
      
      uploadAvatar(req, res, (err) => {
        if(err) {
          return res.json({success: false, data: err});
        } else {
          var total_path = '/' + clean_path + req.file.filename;

          User.update({_id: req.user._id}, {$set: {'local.avatar': total_path}}, {upsert: true}, (err, data) => {
            if(err) {
              res.json({success: false, data: err});
            } else {
              req.user.local.avatar = total_path;
              req.session.save((err) => {
                res.json({success: true, data: {data: data, path: total_path}});
              }); // req.session.save()
            } // if/else
          }); // User.update()
        } // if/else
      }); // uploadAvatar()
    }); // mkdirp()
  }); // POST /profile/avatar/upload

  // Subir un documento
  // ==============================================
  router.post('/document/upload', mw.isAdmin, (req, res) => {
    mkdirp('document/upload', (err) => {
      var storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'document/upload');
        }, // destination
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        } // filename
      }); // multer.diskStorage()

      var uploadDocument = multer({
        storage: storage,
        limits: {
          fileSize: 10000000,
          files: 15
        }
      }).array('document', 15);

      uploadDocument(req, res, (err) => {
        if(err) {
          return res.failure(-1, err, 200);
        } else {
          var i,
              j,
              usersArr = [],
              uploadsArray = [];

          for(j = 0; j < req.files.length; j++) {
            var newUpload = new Upload();
            newUpload.uploadedBy.id       = req.user._id;
            newUpload.uploadedAt          = Date.now();
            newUpload.uploadedBy.username = req.user.local.username;
            newUpload.uploadName          = req.files[j].originalname;
            newUpload.uploadSize          = req.files[j].size;
            newUpload.uploadPath          = req.files[j].path;
            newUpload.uploadAlias         = req.files[j].originalname;
            newUpload.uploadTo.folder     = req.body.folder;
            if(req.body.global) {
              newUpload.uploadTo.global = true;
            } else {
              usersArr = JSON.parse(req.body.userId);
              for(i = 0; i < usersArr.length; i++) {
                newUpload.uploadTo.users.push(usersArr[i]);
              } // for()
            } // if/else
            uploadsArray.push(newUpload);
          } // for()

          Upload.insertMany(uploadsArray, (err, docs) => {
            if(err) {
              return res.failure(-1, err, 200);
            } else {
              var docsId = []; 
              docsId = docs.map((obj) => {
                return obj._id;
              }); // docs.map()

              User.update({
                  _id: { $in: usersArr }
                }, {
                  $push: { "local.uploadedDocuments": { $each: docsId } }
                }, {
                  multi: true
                }, (err, updated) => {
                  return (err) ?
                    res.failure(-1, err, 200) :
                    res.success(docs, 200);
                }); // User.updated()
            } // if/else
          }); // Upload.insertMany()
        } // if/else
      }); // uploadDocument()
    }); // mkdirp()
  }); // POST /document/upload

  // Traer Alertas User
  // ==============================================
  router.get('/userAlerts', mw.requireLogin, (req, res) => {
    User
      .findById({_id: req.user._id})
      .populate('local.alerts')
      .exec(function(err, user) {
        return (err) ?
          res.failure(-1, err, 200) :
          res.success(user.local.alerts, 200);
      }); // exec()
  }); // GET /userAlerts

  // Traer Documentos User
  // ==============================================
  router.get('/userDocuments', mw.requireLogin, (req, res) => {
    User
      .findById({_id: req.user._id})
      .populate('local.uploadedDocuments')
      .exec((err, user) => {
        return (err) ?
          res.failure(-1, err, 200) :
          res.success(user.local.uploadedDocuments, 200);
      }); // exec()
  }); // GET /userDocuments

  // Traer Información del User
  // ==============================================
  router.post('/user', mw.requireLogin, (req, res, next) => {
    User
      .findById({_id: req.user._id})
      .exec((err, user) => {
        return (err) ?
          res.failure(-1, err, 200) :
          res.success(user, 200);
      }); // exec()
  }); // POST /user





// USUARIOS RENDER VISTAS
// ==============================================
// ==============================================
  router.get('/user', mw.requireLogin, (req, res) => {
    res.render('user', {
      app: appConfig,
      user: req.user
    });
  }); // GET /user

  router.get('/user/settings', mw.requireLogin, (req, res) => {
    res.render('user-settings', {
      app: appConfig,
      user: req.user
    });
  }); // GET /user/settings

  router.get('/user/config', mw.requireLogin, (req, res) => {
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

  router.get('/dashboard/crud', mw.isAdmin, (req, res) => {
    res.render('generator-crud', {
      app: appConfig
    });
  }); // GET /dashboard/crud

module.exports = router;