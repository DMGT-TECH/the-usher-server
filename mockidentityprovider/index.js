// Mock Identity Provider for The Usher
require('dotenv').config()
const createError = require('http-errors')
const usherCors = require('cors')
const express = require('express')
const helmet = require('helmet')
const http = require('node:http')
const oasTools = require('@oas-tools/core')
const path = require('node:path')

const keystore = require('./src/utils/keystore.js')
const keygen = require('./src/api_endpoints/endpoint_generate_new_keys.js')

// Normalizes a port into a number, string, or false
function normalizePort (val) {
  var port = parseInt(val, 10)
  if (isNaN(port)) {
    return val // named pipe
  }
  if (port >= 0) {
    return port
  }
  return false
}

async function seedKeysIfDbIsEmpty () {
  if ((await keystore.selectAllKeys()).length === 0) {
    console.log('Note: There were no keys in the database generating and inserting a new key.')
    await keygen.generateAndInsertNewKeys()
  }
}

const oasOptions = {
  oasFile: 'mockidentityprovider-openapi-spec.yaml',
  logger: {
    loglevel: 'info',
    logFile: 'logs.txt',
    logFilePath: '.'
  },
  middleware: {
    router: {
      controllers: path.join(__dirname, 'src/api_endpoints')
    },
    swagger: {
      disable: false,
      path: '/docs'
    },
    validator: {
      strict: true
    }
  }
}

const expressApp = express()
expressApp.use(helmet())
expressApp.use(express.json())
expressApp.use(usherCors())

oasTools.initialize(expressApp, oasOptions).then(() => {
  const port = normalizePort(process.env.PORT || '3002')
  http.createServer(expressApp).listen(port, () => {
    console.log('🚀 Mock Identity Server up and running!')
  })

  // Default route to handle not found endpoints but return 405 for security
  expressApp.use((req, res, next) => {
    const notFoundResponse = {
      code: 405,
      message: 'Method Not Allowed'
    }
    res.status(405).send(notFoundResponse)
  })
})

expressApp.use((err, req, res, next) => {
  // This error handler is for oas-tools generated errors
  if (err?.failedValidation) {
    return next(createError(400, err.validationResult[0].message))
  }
  // carry on to next error handler
  next(err)
})

expressApp.use((err, req, res, next) => {
  // handle case if headers have already been sent to client
  if (res.headersSent) {
    return next(err)
  }

  res.status(err.status || 500)
    .send({
      code: err.status || 500,
      message: err.message || 'General App Error'
    })
})

seedKeysIfDbIsEmpty()
