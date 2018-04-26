/**
 * Variables
 */
const cacheTime = 86400000 * 30

/**
 * Modules
 */
const bodyParser = require('body-parser')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const express = require('express')
const favicon = require('serve-favicon')
const fs = require('fs')
const http = require('http')
const path = require('path')
const logger = require('morgan')
const passport = require('passport')
const helmet = require('helmet')
const swaggerUi = require('swaggerize-ui')
const jsonfile = require('jsonfile')
const cors = require('cors')

/**
 * App configuration
 */
const APP = require('./config/app/main')

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

app.use(cors())

/**
 * Response definition
 */
app.use((req, res, next) => {
  res.success = (data, status) => {
    return res.status(status || 200).send({
      success: true,
      data: data || '',
      error: null
    })
  }

  res.failure = (errorCode, errorMsg, status) => {
    return res.status(status || 200).send({
      success: false,
      data: null,
      error: {
        code: errorCode || -1,
        message: errorMsg || 'Error Interno'
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

/**
 * Require Mongo configuration
 */
require('./config/mongo/config')

/**
 * Require local and social network passport
 */
require('./config/passport/index')()

/**
 * View engine setup
 */
app.use(bodyParser.json({
  limit: '50mb'
}))
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}))

app.use(cookieParser(APP.name))

app.use(passport.initialize())
app.use(passport.session())

/**
 * Routes
 const login = require('./routes/login')
 const user = require('./routes/user')
 const api = require('./routes/api')
*/

/**
 * Routes usage
 app.use('/', login)
 app.use('/', user)
 app.use('/', api)
*/
require('./routes/index')(app)
/*
app.use('/api-docs', (req, res) => {
  res.json(require('./docs/api.json'))
})

app.use('/internal/docs', swaggerUi({
  validatorUrl: null,
  docs: '/api-docs'
}))
*/
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
    res.status(err.status || 500).send({
      success: false,
      error: {
        code: -1,
        message: err.message
      }
    })
  })
}

/**
 * Production error handler
 * No stacktraces leaked to user
 */
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    success: false,
    error: {
      code: -1,
      message: err.message
    }
  })
})

/**
 * Set PORT
 */
app.set('port', process.env.PORT || APP.port)

/**
 * Firing Up express
 */
const server = http.createServer(app).listen(app.get('port'), '127.0.0.1', () => {
  console.log(`${APP.name} server listening on port ${app.get('port')}`)
})

module.exports = app