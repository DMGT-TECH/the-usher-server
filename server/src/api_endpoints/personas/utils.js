const dbAdminPersona = require('database/layer/admin-persona')
const dbAdminPermission = require('database/layer/admin-permission')
const dbAdminPersonaRoles = require('database/layer/admin-personarole')

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

module.exports = {
  checkPersonaExists,
  checkPermissionExists,
  checkPersonaRolesValidity,
}
