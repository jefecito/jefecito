/* jshint esversion: 6 */

//====================================================================
var bodyParser   = require('body-parser');
var compression  = require('compression');
var cookieParser = require('cookie-parser');
var express      = require('express');
var favicon      = require('serve-favicon');
var fs           = require('fs');
var http         = require('http');
var https        = require('https');
var logger       = require('morgan');
var passport     = require('passport');
var session      = require('express-session');
var MongoStore   = require('connect-mongo')(session);
var path         = require('path');
var helmet       = require('helmet');
var swaggerUi    = require('swaggerize-ui');
var jsonfile     = require('jsonfile');


if(!fs.existsSync('./logs')) {
  console.log('[+] logs folder created');
  fs.mkdirSync('./logs');
}


//Routes
//=====================================================================
var index = require('./routes/index');
var login = require('./routes/login');
var user  = require('./routes/user');
var api   = require('./routes/api');

//Express configuration
//======================================================================
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 2);
app.use(logger('dev'));

var cacheTime = 86400000*30;
app.use(express.static(path.join(__dirname, 'public'),{maxAge: cacheTime}));

//ERROR LOG MANAGEMENT
var errorLogStream = fs.createWriteStream(__dirname + '/logs/error.log', {flags: 'a'});

//Error handling, avoiding crash
process.on('uncaughtException', (err, req, res, next) => {
  var date = new Date();
  console.error("+++++++ "+ date + " error found, logging event +++++++ ");
  console.error(err.stack);
  errorLogStream.write(date+ '\n'+ err.stack+'\n\n');
  return;
});

//HELMET SECURITY Lib
app.use(helmet());

//RESPONSES DEFINITION
app.use((req, res, next) => {
  res.success = (data, status) => {
    return res.status((status) ? status : 200).send({
      success: true,
      data: (data) ? data : '',
      error: null
    });
  };
  res.failure = (errorCode, errorMsg, status) => {
    return res.status((status) ? status : 200).send({
      success: false,
      data: null,
      error: {
        code: (errorCode) ? errorCode : -1,
        message: (errorMsg) ? errorMsg : 'Unknown Error'
      }
    });
  };
  next();
});

//Compress middleware to gzip content
app.use(compression());
//app.use(favicon(__dirname + '/public/img/favicon.png'));

//INITIAL JEFECITO CONFIG
var file = './config/config.json';
var cfg  = require(file);

if(cfg.configured === false){
  console.log("[+] You have to configure the App");
  app.use((req, res, next) => {
    jsonfile.readFile(file, (err, f) => {
      if(err){
        return res.failure(-1, err, 200);
      }else{
        if(f.configured === false){
          if(req.method == "POST")
            next();
          else
            return res.render("appConfig");
        }else{
          next();
        }
      }//else
    });
  });
}else{
  console.log("[+] App Configured, connecting to DB ..");
  require('./config/mongo_conn');
}

require('./config/passport-local');
require('./config/passport-facebook');
require('./config/passport-google');

//View engine setup
//======================================================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser(cfg.appName));

app.use(session({
   name: cfg.appName,
   secret:'some_secret',
   saveUninitialized: true,
   resave: true,
   cookie: { maxAge: 1000*60*60*2 },
   store: new MongoStore({
      url: 'mongodb://localhost/'+cfg.appName,
      host: 'localhost',
      collection: 'sessions',
      autoReconnect: true,
      clear_interval: 3600
   })
}));

app.use(passport.initialize());
app.use(passport.session());

//Routes usage =====================================================
app.use('/', index);
app.use('/', login);
app.use('/', user);
app.use('/', api);

app.use('/api-docs', (req, res) => {
  res.json(require('./docs/api.json'));
});

app.use('/internal/docs', swaggerUi({
  validatorUrl: null,
  docs: '/api-docs'
}));

//Disable server banner header
app.disable('x-powered-by');

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if(process.env.NODE_ENV === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//Firing Up express
//====================================================================
app.set('port', process.env.PORT || 3000);

var server = http.createServer(app).listen(app.get('port'), '127.0.0.1', () => {
  console.log(cfg.appName+" server listening on port " + app.get('port'));
});

module.exports = app;