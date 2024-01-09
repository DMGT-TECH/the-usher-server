const createError = require('http-errors')
const dbAdminPersonaRoles = require('database/layer/admin-personarole')
const { checkPersonaExists } = require('./utils')

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

module.exports = {
  getPersonaRoles,
}
