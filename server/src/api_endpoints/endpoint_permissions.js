const createError = require('http-errors')
const dbAdminPermission = require('database/layer/admin-permission')

/**
 * HTTP Request handler
 * Returns a list of permissions
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object to send 200 statusCode and a list of permissions
 * @param {Function} next - The next middleware function
 * @returns {Promise<void>} - A promise that resolves to void when permissions are retrieved
 */
const getPermissions = async (req, res, next) => {
  try {
    const { name, client_id: clientId, client_key: clientKey } = req.query
    const permissions = await dbAdminPermission.getPermissions({ name, clientId, clientKey })
    res.status(200).send(permissions)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = { getPermissions }
