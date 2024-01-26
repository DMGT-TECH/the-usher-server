const createError = require('http-errors')
const dbAdminPersona = require('database/layer/admin-persona')
const { checkPersonaExists } = require('./utils')

const createPersona = async (req, res, next) => {
  try {
    const { tenant_key, sub_claim, user_context } = req.body
    const persona = await dbAdminPersona.insertPersonaByTenantKey(tenant_key, sub_claim, user_context)
    res.status(201).send(persona)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

/**
 * HTTP Request handler
 * Delete a persona by key and sends 204 statusCode on success
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Promise<void>} - A promise that resolves to void
 */
const deletePersona = async (req, res, next) => {
  try {
    const { persona_key: personaKey } = req.params
    await checkPersonaExists(personaKey)
    await dbAdminPersona.deletePersonaByKey(personaKey)
    res.status(204).send()
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  createPersona,
  deletePersona,
}
