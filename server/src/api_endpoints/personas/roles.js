const createError = require('http-errors')
const dbAdminPersonaRoles = require('database/layer/admin-personarole')
const { checkPersonaExists, checkPersonaRolesValidity } = require('./utils')

const getPersonaRoles = async (req, res, next) => {
  try {
    const { persona_key: personaKey } = req.params
    await checkPersonaExists(personaKey)
    const roles = await dbAdminPersonaRoles.getPersonaRoles(personaKey)
    res.status(200).send(roles)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

const createPersonaRoles = async (req, res, next) => {
  try {
    const { persona_key: personaKey } = req.params
    const roleKeys = Array.from((new Set(req.body)))
    await Promise.all([
      checkPersonaExists(personaKey),
      checkPersonaRolesValidity(personaKey, roleKeys)
    ])
    await dbAdminPersonaRoles.insertPersonaRoles(personaKey, roleKeys)
    const locationUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    res.set('Location', locationUrl)
    res.status(204).send()
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  getPersonaRoles,
  createPersonaRoles,
}
