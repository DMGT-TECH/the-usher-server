const createError = require('http-errors')
const dbAdminRoles = require('database/layer/admin-role')
const dbAdminPermissions = require('database/layer/admin-permission')

/**
 * Client Admin function to get a list of Roles for given Client
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const listClientRoles = async (req, res, next) => {
  try {
    const { client_id: clientId } = req.params
    const { include_permissions } = req.query
    const roles = await dbAdminRoles.listRoles(clientId)
    if (include_permissions === 'true') {
      for (const role of roles) {
        role.permissions = await dbAdminPermissions.getPermissionsByRoleKey(role.key)
      }
    }
    res.status(200).send({ data: roles })
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

/**
 * Client Admin function to create a new Role and link to given Client
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const createClientRole = async (req, res, next) => {
  const clientId = req.params.client_id
  const name = req.body.name
  const description = req.body.description

  try {
    const role = await dbAdminRoles.insertRoleByClientId(clientId, name, description)
    res.status(201).send(role)
  } catch (err) {
    return next(createError(500, err))
  }
}

module.exports = {
  listClientRoles,
  createClientRole,
}
