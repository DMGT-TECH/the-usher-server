const createError = require('http-errors')
const dbAdminRole = require('database/layer/admin-role')
const dbAdminPermissions = require('database/layer/admin-permission')

module.exports = {
  getRole,
  patchRole,
  deleteRole
}

/**
 * Usher admin function to get a single Role object
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns Role object
 */
async function getRole(req, res, next) {
  const roleKey = req.params.role_key
  const { includePermissions } = req.query
  try {
    const role = await dbAdminRole.getRole(roleKey)
    if (!role) {
      return next(createError(404, 'Role key not found or no access'))
    }
    if (includePermissions === 'true') {
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
async function patchRole(req, res, next) {
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
async function deleteRole(req, res, next) {
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
