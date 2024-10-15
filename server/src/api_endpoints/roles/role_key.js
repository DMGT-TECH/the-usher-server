const createError = require('http-errors')
const dbAdminRole = require('database/layer/admin-role')
const dbAdminPermissions = require('database/layer/admin-permission')

/**
 * Usher admin function to get a single Role object
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns Role object
 */
const getRole = async (req, res, next) => {
  const roleKey = req.params.role_key
  const { include_permissions } = req.query
  try {
    const role = await dbAdminRole.getRole(roleKey)
    if (!role) {
      return next(createError(404, 'Role key not found or no access'))
    }
    if (include_permissions === 'true') {
      role.permissions = await dbAdminPermissions.getPermissionsByRoleKey(role.key)
    }
    res.status(200).send(role)
  } catch (err) {
    return next(createError(500, err))
  }
}

/**
 * Usher admin function to update attributes (PATCH) a Role object
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const patchRole = async (req, res, next) => {
  // const roleKey = req.params.role_key
  // try {
  //   const role = await getRole(req, res, next)
  //   // Role exists, patch
  // } catch (err) {
  //   if (err.statusCode === 404) {
  //     return next(err)
  //   }
  //   return next(createError(500, err))
  // }
}

/**
 * Usher admin function to delete a Role object
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const deleteRole = async (req, res, next) => {
  // const roleKey = req.params.role_key
  // try {
  //   const role = await getRole(req, res, next)
  //   // Role exists, delete
  // } catch (err) {
  //   if (err.statusCode === 404) {
  //     return next(err)
  //   }
  //   return next(createError(500, err))
  // }
}

module.exports = {
  getRole,
  patchRole,
  deleteRole
}
