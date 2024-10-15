const createError = require('http-errors')
const dbAdminRole = require('database/layer/admin-role')
const dbAdminPermissions = require('database/layer/admin-permission')

const getRoles = async (req, res, next) => {
  try {
    const { clientId, include_permissions } = req.query
    const roles = await dbAdminRole.listRoles(clientId)
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

const createRole = async (req, res, next) => {
  // perm access checked by middleware
  let role
  try {
    role = await dbAdminRole.insertRoleByClientId(req.body.client_id, req.body.name, req.body.description)
    // TODO another way of handling errors between db and within API, need to standardize
    // TODO should API responses return the created and updated at timestamp columns
    if (typeof role === 'string') {
      throw new Error(role)
    }
  } catch (err) {
    return next(createError(400, err))
  }
  res.status(201).send(role)
}

module.exports = { getRoles, createRole }
