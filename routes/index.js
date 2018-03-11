/* jshint esversion: 6 */

// REQUIREs
// ==============================================
// ==============================================
var express   = require('express');
var passport  = require('passport');
var router    = express.Router();
var User      = require('../models/users');
var mw        = require('../middlewares/app');
var validator = require('validator');
var jsonfile  = require('jsonfile');
var appConfig = require('../config/config');


// APP: Renderiza la vista de configuracion
// ==============================================
// ==============================================
router.get('/appConfig', (req, res) => {
  res.render('appConfig', {});
}); // GET /appConfig

// APP: Crea la configuracion de la aplicacion
// ==============================================
// ==============================================
router.post('/appConfig', (req, res) => {
  var file = './config/config.json';
  var data = {
    appName: req.body.name,
    appURL: req.body.url,
    configured: req.body.configured || true
  }; // data

  jsonfile.writeFile(file, data, {spaces: 2}, (err, d) => {
    return err ?
      res.failure(-1, err, 200) :
      res.success(d, 200);
  }); // jsonfile.writeFile()
}); // POST /appConfig

router.get('/', (req, res) => {
  res.render('index', {
    app: appConfig
  });
}); // GET /

module.exports = router;