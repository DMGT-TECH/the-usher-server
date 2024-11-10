const dbAdminRole = require('database/layer/admin-role')
const dbAdminRolePermissions = require('database/layer/admin-rolepermissions')

const checkRoleExists = async (roleKey) => {
  const role = await dbAdminRole.getRole(roleKey)
  if (!role) {
    const error = new Error('Role does not exist!')
    error.httpStatusCode = 404
    throw error
  }
}

/**
 * Checks if provided permission keys are valid for the given role key
 * Throws an error if any of the permissions are invalid
 *
 * @param {number} roleKey - The key of the role
 * @param {number[]} permissionKeys - An array of permission keys to check for validity
 * @throws {object} Error object with httpStatusCode and message properties
 */
const checkRolePermissionsValidity = async (roleKey, permissionKeys) => {
  const validPermissions = await dbAdminRolePermissions.getPermissionsForRoleWithinSameClient(roleKey, permissionKeys)
  if (validPermissions.length !== permissionKeys.length) {
    const error = new Error('Permissions should be assigned to the same client as the subject role.')
    error.httpStatusCode = 400
    throw error
  }
}

module.exports = {
  checkRoleExists,
  checkRolePermissionsValidity,
}
