const createError = require('http-errors')
const dbAdminPersona = require('database/layer/admin-persona')
const { checkPersonaExists } = require('./utils')

const getPersonaPermissions = async (req, res, next) => {
  try {
    const { persona_key: personaKey } = req.params
    await checkPersonaExists(personaKey)
    const permissions = await dbAdminPersona.getPersonaPermissions(personaKey)
    res.status(200).send(permissions)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

const createPersonaPermissions = async (req, res, next) => {
  try {
    const { persona_key: personaKey } = req.params
    await checkPersonaExists(personaKey)
    await dbAdminPersona.insertPersonaPermissions(personaKey, req.body)
    const locationUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    res.set('Location', locationUrl)
    res.status(201).send()
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  getPersonaPermissions,
  createPersonaPermissions,
}
