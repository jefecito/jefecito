/**
 * Variables
 */
const cacheTime = 86400000 * 30
const cookieTime = 1000 * 60 * 60 * 2

/**
 * Requires
 */
const bodyParser = require('body-parser')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const express = require('express')
const favicon = require('serve-favicon')
const fs = require('fs')
const http = require('http')
const https = require('https')
const logger = require('morgan')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const path = require('path')
const helmet = require('helmet')
const swaggerUi = require('swaggerize-ui')
const jsonfile = require('jsonfile')

/**
 * Creates folder log
 */
if (!fs.existsSync('./logs')) {
  console.log('[+] logs folder created')
  fs.mkdirSync('./logs')
}

/**
 * Express configuration
 */
const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('json spaces', 2)
app.use(logger('dev'))

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: cacheTime
}))

/**
 * Error log management
 */
let errorLogStream = fs.createWriteStream(__dirname + '/logs/error.log', {
  flags: 'a'
})

/**
 * Error handling, avoiding crash
 */
process.on('uncaughtException', (err, req, res, next) => {
  let date = new Date()
  console.error(`+++++++ ${date} error found, logging event +++++++ `)
  console.error(err.stack)
  errorLogStream.write(`${date} \n ${err.stack} \n\n`)
  return
})

/**
 * Helment security lib
 */
app.use(helmet())

/**
 * Response definition
 */
app.use((req, res, next) => {
  res.success = (data, status) => {
    return res.status(status ? status : 200).send({
      success: true,
      data: data ? data : '',
      error: null
    })
  }

  res.failure = (errorCode, errorMsg, status) => {
    return res.status(status ? status : 200).send({
      success: false,
      data: null,
      error: {
        code: errorCode ? errorCode : -1,
        message: errorMsg ? errorMsg : 'Unknown Error'
      }
    })
  }
  next()
})

/**
 * Compress middleware to gzip content
 */
app.use(compression())
// app.use(favicon(__dirname + '/public/img/favicon.png'))

/*
  // INITIAL JEFECITO CONFIG
  let file = './config/app/config.json'
  const cfg = require(file)

  if (cfg.configured === false) {
    console.log('[+] You have to configure the App')

    app.use((req, res, next) => {
      jsonfile.readFile(file, (err, f) => {
        if (err) {
          return res.failure(-1, err, 200)
        } else {
          if (f.configured === false) {
            if (req.method == "POST") {
              next()
            } else {
              return res.render("appConfig")
            }
          } else {
            next()
          }
        } // if/else
      })
    })
  } else {
    console.log('[+] App Configured, connecting to DB ...')
    require('./config/mongo/config')
  }
*/

/**
 * Require Mongo configuration
 */
require('./config/mongo/config')

/**
 * Require app configuration
 */
const APP = require('./config/app/main')

/**
 * Require local and social network passport
 */
require('./config/passport/index')

/**
 * View engine setup
 */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser(APP.name))

app.use(session({
  name: APP.name,
  secret:'some_secret',
  saveUninitialized: true,
  resave: true,
  cookie: {
    maxAge: cookieTime
  },
  store: new MongoStore({
    url: `mongodb://localhost/${APP.name}`,
    host: 'localhost',
    collection: 'sessions',
    autoReconnect: true,
    clear_interval: 3600
  })
}))

app.use(passport.initialize())
app.use(passport.session())

/**
 * Routes
 */
const index = require('./routes/index')
const login = require('./routes/login')
const user = require('./routes/user')
const api = require('./routes/api')

/**
 * Routes usage
 */
app.use('/', index)
app.use('/', login)
app.use('/', user)
app.use('/', api)
require('./routes/authRoute')(app)

app.use('/api-docs', (req, res) => {
  res.json(require('./docs/api.json'))
})

app.use('/internal/docs', swaggerUi({
  validatorUrl: null,
  docs: '/api-docs'
}))

/**
 * Disable server banner header
 */
app.disable('x-powered-by')

/**
 * Catch 404 and forward to error handler
 */
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

/**
 * Error Handlers
 * 
 * Development error handler
 * Will print stacktrace
 */
if (process.env.NODE_ENV === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

/**
 * Production error handler
 * No stacktraces leaked to user
 */
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

/**
 * Firing Up express
 */
app.set('port', process.env.PORT || 3000)

const server = http.createServer(app).listen(app.get('port'), '127.0.0.1', () => {
  console.log(`${APP.name} server listening on port ${app.get('port')}`)
})

module.exports = app