const dbAdminRole = require('database/layer/admin-role')
const dbAdminPersona = require('database/layer/admin-persona')
const dbAdminPermission = require('database/layer/admin-permission')
const dbAdminPersonaRoles = require('database/layer/admin-personarole')
const dbAdminPersonaPermissions = require('database/layer/admin-personapermission')

const checkPersonaExists = async (personaKey) => {
  const persona = await dbAdminPersona.getPersona(personaKey)
  if (!persona) {
    throw {
      httpStatusCode: 404,
      message: 'Persona does not exist!'
    }
  }
}

const checkPermissionExists = async (permissionKey) => {
  const permission = await dbAdminPermission.getPermission(permissionKey)
  if (!permission) {
    throw {
      httpStatusCode: 404,
      message: 'Permission does not exist!'
    }
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
    throw {
      httpStatusCode: 400,
      message: 'Make sure to provide valid role keys which are associated with clients in the same tenant!',
    }
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
    throw {
      httpStatusCode: 400,
      message: 'Make sure to provide valid permission keys which are associated with clients in the same tenant!',
    }
  }
}

const checkRoleExists = async (roleKey) => {
  const role = await dbAdminRole.getRole(roleKey)
  if (!role) {
    throw {
      httpStatusCode: 404,
      message: 'Role does not exist!'
    }
  }
}

/**
 * Converts a filter query string into a filter object
 *
 * @param {string} filterQuery - The filter query string (E.g. 'tenantname:value1, sub_claim:value2')
 * @returns {Object} - The generated filter object
 * @throws {Object} - Error object with HTTP status code and message if the filter query is invalid
 */
const getFilterObjectFromFilterQueryString = (filterQuery) => {
  try {
    return filterQuery ? filterQuery.split(',').reduce((acc, filter) => {
      const [field, value] = filter.split(':').map((v) => {
        return v.trim()
      })
      acc[field] = value
      return acc
    }, {}) : {}
  } catch {
    throw {
      httpStatusCode: 400,
      message: 'Invalid filter query!'
    }
  }
}

module.exports = {
  checkPersonaExists,
  checkPermissionExists,
  checkPersonaRolesValidity,
  checkPersonaPermissionsValidity,
  checkRoleExists,
  getFilterObjectFromFilterQueryString,
}
