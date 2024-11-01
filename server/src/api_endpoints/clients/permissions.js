const createError = require('http-errors')
const dbAdminPermission = require('database/layer/admin-permission')
const { checkClientExists, checkPermissionNameUniqueness } = require('./utils')

/**
 * HTTP Request handler
 * Create a permission
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object to send 201 statusCode and the cerated permission on success
 * @param {Function} next - The next middleware function
 * @returns {Promise<void>} - A Promise that resolves to void when the permission is created
 */
const createPermission = async (req, res, next) => {
  try {
    const { client_id: clientId } = req.params
    const client = await checkClientExists(clientId)
    const payload = {
      ...req.body,
      clientkey: client.key,
    }
    await checkPermissionNameUniqueness(payload)
    const permission = await dbAdminPermission.insertPermission(payload)
    res.status(201).send(permission)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  createPermission,
}
