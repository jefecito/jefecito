/* jshint esversion: 6 */

// REQUIREs
// ==============================================
// ==============================================
const express   = require('express')
const passport  = require('passport')
const router    = express.Router()
const mongoose  = require('mongoose')
const validator = require('validator')
const mw        = require('../middlewares/app')
const jsonfile  = require('jsonfile')
const appConfig = require('../config/app/config')


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