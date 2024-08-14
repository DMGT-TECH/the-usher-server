const createError = require('http-errors')
const dbAdminRolePermissions = require('database/layer/admin-rolepermission')
const { checkRoleExists } = require('./utils')

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

module.exports = {
  getRolesPermissions,
}
