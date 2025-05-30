const createError = require('http-errors')
const dbAdminRolePermissions = require('database/layer/admin-rolepermissions')
const { checkRoleExists, checkRolePermissionsValidity } = require('./utils')

/**
 * HTTP Request Handler to get all permissions assigned to a role.
 *
 * Handles GET requests to /roles/{role_key}/permissions.
 * Ensures the role exists and retrieves the list of permissions for the specified role.
 *
 * @async
 * @function getRolesPermissions
 * @param {import('express').Request} req - Express request object, expects `role_key` in params.
 * @param {import('express').Response} res - Express response object, sends a 200 status with the permissions array.
 * @param {Function} next - Express next middleware function for error handling.
 * @returns {Promise<void>} Resolves when the permissions are successfully retrieved or an error occurs.
 * @throws {HttpError} If the role does not exist or a database error occurs.
 */
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
 * HTTP Request Handler for assigning a list of permissions to a role.
 *
 * Handles PUT requests to /roles/{role_key}/permissions.
 * Ensures the role exists, validates the permissions, and updates the database accordingly.
 *
 * @async
 * @function createRolePermissions
 * @param {import('express').Request} req - Express request object, expects `role_key` in params and an array of permission keys in the body.
 * @param {import('express').Response} res - Express response object, sends a 204 status with a Location header.
 * @param {Function} next - Express next middleware function for error handling.
 * @returns {Promise<void>} Resolves when the role permissions are successfully created or an error occurs.
 * @throws {HttpError} If the role does not exist, permissions are invalid, or a database error occurs.
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

/**
 * HTTP Request Handler to delete a specific permission from a role.
 *
 * Handles DELETE requests to /roles/{role_key}/permissions/{permission_key}.
 * Ensures the role exists and deletes the role-permission mapping from the database.
 *
 * @async
 * @function deleteRolePermissions
 * @param {import('express').Request} req - Express request object, expects `role_key` and `permission_key` in params.
 * @param {import('express').Response} res - Express response object, sends a 204 status with a Location header.
 * @param {Function} next - Express next middleware function for error handling.
 * @returns {Promise<void>} Resolves when the permission is successfully deleted or an error occurs.
 * @throws {HttpError} If the role does not exist or a database error occurs.
 */
async function deleteRolePermissions(req, res, next) {
  try {
    const { role_key: roleKey, permission_key: permissionKey } = req.params
    await checkRoleExists(roleKey)
    await dbAdminRolePermissions.deleteRolePermissions(roleKey, permissionKey)
    const locationUrl = `${req.protocol}://${req.get('host')}/${roleKey}/permissions`
    res.set('Location', locationUrl)
    return res.status(204).send()
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  getRolesPermissions,
  createRolePermissions,
  deleteRolePermissions,
}
