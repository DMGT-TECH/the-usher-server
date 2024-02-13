const createError = require('http-errors')
const dbAdminPersona = require('database/layer/admin-persona')
const { checkPersonaExists, getFilterObjectFromFilterQueryString } = require('./utils')

/**
 * HTTP Request handler
 * Create a persona
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object to send 201 statusCode and the cerated persona on success
 * @param {Function} next - The next middleware function
 * @returns {Promise<void>} - A Promise that resolves to void when the persona is created
 */
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
 * Delete a persona by key
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object to send 204 statusCode on success
 * @param {Function} next - The next middleware function
 * @returns {Promise<void>} - A promise that resolves to void when persona is deleted
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

/**
 * HTTP Request handler
 * Get personas with optional filtering, sorting, and ordering
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object to send 200 statusCode and a list of personas
 * @param {Function} next - The callback function for the next middleware
 * @returns {Promise<void>} - A promise that resolves to void when personas are retrieved
 */
const getPersonas = async (req, res, next) => {
  try {
    const { filter, sort, order } = req.query
    const personas = await dbAdminPersona.getPersonas(getFilterObjectFromFilterQueryString(filter), sort, order)
    res.status(200).send(personas);
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  createPersona,
  deletePersona,
  getPersonas,
}
