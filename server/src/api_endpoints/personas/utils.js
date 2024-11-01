const dbAdminRole = require('database/layer/admin-role')
const dbAdminPersona = require('database/layer/admin-persona')
const dbAdminPermission = require('database/layer/admin-permission')
const dbAdminPersonaRoles = require('database/layer/admin-personarole')
const dbAdminPersonaPermissions = require('database/layer/admin-personapermission')

const checkPersonaExists = async (personaKey) => {
  const persona = await dbAdminPersona.getPersona(personaKey)
  if (!persona) {
    const error = new Error('Persona does not exist!')
    error.httpStatusCode = 404
    throw error
  }
}

const checkPermissionExists = async (permissionKey) => {
  const permission = await dbAdminPermission.getPermission(permissionKey)
  if (!permission) {
    const error = new Error('Permission does not exist!')
    error.httpStatusCode = 404
    throw error
  }
}

/**
 * Checks if provided role keys are valid for the given persona key
 * Throws an error if any of the roles are invalid
 *
 * @param {number} personaKey - The key of the persona
 * @param {number[]} roleKeys - An array of role keys to check for validity
 * @throws {object} Error object with httpStatusCode and message properties if invalid roles are found
 */
const checkPersonaRolesValidity = async (personaKey, roleKeys) => {
  const validRoles = await dbAdminPersonaRoles.selectPersonaRolesInTheSameTenant(personaKey, roleKeys)
  if (validRoles.length !== roleKeys.length) {
    const error = new Error('Make sure to provide valid role keys which are associated with clients in the same tenant!')
    error.httpStatusCode = 400
    throw error
  }
}

/**
 * Checks if provided permission keys are valid for the given persona key
 * Throws an error if any of the permissions are invalid
 *
 * @param {number} personaKey - The key of the persona
 * @param {number[]} permissionKeys - An array of permission keys to check for validity
 * @throws {object} Error object with httpStatusCode and message properties if invalid permissions are found
 */
const checkPersonaPermissionsValidity = async (personaKey, permissionKeys) => {
  const validPermissions = await dbAdminPersonaPermissions.selectPersonaPermissionsInTheSameTenant(personaKey, permissionKeys)
  if (validPermissions.length !== permissionKeys.length) {
    const error = new Error('Make sure to provide valid permission keys which are associated with clients in the same tenant!')
    error.httpStatusCode = 400
    throw error
  }
}

const checkRoleExists = async (roleKey) => {
  const role = await dbAdminRole.getRole(roleKey)
  if (!role) {
    const error = new Error('Role does not exist!')
    error.httpStatusCode = 404
    throw error
  }
}

module.exports = {
  checkPersonaExists,
  checkPermissionExists,
  checkPersonaRolesValidity,
  checkPersonaPermissionsValidity,
  checkRoleExists,
}
