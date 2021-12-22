// Mock Identity Provider for The Usher
require('dotenv').config()
const createError = require('http-errors')
const keystore = require('./src/utils/keystore.js')
const keygen = require('./src/api_endpoints/endpoint_generate_new_keys.js')
const usherCors = require('cors')
const express = require('express')
const fs = require('fs')
const helmet = require('helmet')
const http = require('http')
const jsyaml = require('js-yaml')
const oasTools = require('oas-tools')
const path = require('path')

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

const optionsObject = {
  controllers: path.join(__dirname, 'src/api_endpoints'),
  checkControllers: false,
  loglevel: 'info',
  logfile: './logs.txt',
  strict: true,
  router: true,
  validator: true,
  docs: null, // Swap this line with next if you want hosted Swagger docs (may not work deployed as cloud function)
  // docs: { apiDocs: '/api-docs', apiDocsPrefix: '', swaggerUi: '/docs', swaggerUiPrefix: '' },
  ignoreUnknownFormats: true,
  oasSecurity: false,
  customErrorHandling: true
}

const spec = fs.readFileSync('mockidentityprovider-openapi-spec.yaml', 'utf8')
const oasDoc = jsyaml.load(spec)
const expressApp = express()
expressApp.use(helmet())
expressApp.use(express.json())
expressApp.use(usherCors())
oasTools.configure(optionsObject)

oasTools.initialize(oasDoc, expressApp, function () {
  const port = normalizePort(process.env.PORT || '3002')
  http.createServer(expressApp).listen(port, function () {
    console.log('Mock Identity Server up and running!')
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

expressApp.use(function (err, req, res, next) {
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

// Default route to handle not found endpoints but return 405 for security
expressApp.use(function (req, res, next) {
  const notFoundResponse = {
    code: 405,
    message: 'Method Not Allowed'
  }
  res.status(405).send(notFoundResponse)
})

seedKeysIfDbIsEmpty()
