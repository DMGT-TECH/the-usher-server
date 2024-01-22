const createError = require('http-errors')
const dbAdminPersonaPermissions = require('database/layer/admin-personapermission')
const { checkPersonaExists, checkPermissionExists, checkPersonaPermissionsValidity } = require('./utils')

const getPersonaPermissions = async (req, res, next) => {
  try {
    const { persona_key: personaKey } = req.params
    await checkPersonaExists(personaKey)
    const permissions = await dbAdminPersonaPermissions.getPersonaPermissions(personaKey)
    res.status(200).send(permissions)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

const createPersonaPermissions = async (req, res, next) => {
  try {
    const { persona_key: personaKey } = req.params
    const permissionKeys = Array.from((new Set(req.body)))
    await Promise.all([
      checkPersonaExists(personaKey),
      checkPersonaPermissionsValidity(personaKey, permissionKeys),
    ])
    await dbAdminPersonaPermissions.insertPersonaPermissions(personaKey, permissionKeys)
    const locationUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    res.set('Location', locationUrl)
    res.status(204).send()
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

const deletePersonaPermission = async (req, res, next) => {
  try {
    const { persona_key: personaKey, permission_key: permissionKey } = req.params
    await Promise.all([
      checkPersonaExists(personaKey),
      checkPermissionExists(permissionKey),
    ])
    await dbAdminPersonaPermissions.deletePersonaPermission(personaKey, permissionKey)
    res.status(204).send()
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  getPersonaPermissions,
  createPersonaPermissions,
  deletePersonaPermission,
}
