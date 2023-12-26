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

module.exports = {
  getPersonaPermissions,
}
