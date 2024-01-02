const dbAdminPersona = require('database/layer/admin-persona')
const dbAdminPermission = require('database/layer/admin-permission')

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

module.exports = {
  checkPersonaExists,
  checkPermissionExists,
}
