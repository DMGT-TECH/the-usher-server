const createError = require('http-errors')
const dbAdminRolePermissions = require('database/layer/admin-rolepermissions')
const { checkRoleExists, checkRolePermissionsValidity } = require('./utils')

const getRolesPermissions = async (req, res, next) => {
  try {
    const { role_key: roleKey } = req.params
    await checkRoleExists(roleKey)
    const permissions = await dbAdminRolePermissions.getRolePermissions(roleKey)
    res.status(200).send(permissions)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

/**
 * HTTP Request Handler for assigning a list of permissions to a role
 *
 * This function handles PUT requests to assign permissions to a specific role within the same client
 * It ensures that the role exists, validates the permissions, and then updates the database accordingly
 *
 * @param {Object} req - The request object, containing parameters and body data
 * @param {Object} res - The response object used to send a 204 status code with no content
 * @param {Function} next - The next middleware function in the stack
 * @returns {Promise<void>} - A Promise that resolves when the role permissions are successfully created or an error occurs
 */
const createRolePermissions = async (req, res, next) => {
  try {
    const { role_key: roleKey } = req.params
    await checkRoleExists(roleKey)
    const permissionKeys = [...new Set(req.body)]
    await checkRolePermissionsValidity(roleKey, permissionKeys)
    await dbAdminRolePermissions.insertRolePermissions(roleKey, permissionKeys)
    const locationUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    res.set('Location', locationUrl)
    res.status(204).send()
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  getRolesPermissions,
  createRolePermissions,
}
