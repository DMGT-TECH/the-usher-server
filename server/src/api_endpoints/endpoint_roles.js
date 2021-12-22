const createError = require('http-errors')
const dbAdminRole = require('database/layer/admin-role')

module.exports = { getRoles, createRole }

async function getRoles (req, res, next) {
  const clientId = req.query.client_id

  // TODO refactor as part of issue #235.
  const roles = await dbAdminRole.listRoles(clientId)
  res.status(200).send({ data: roles })
}

async function createRole (req, res, next) {
  // perm access checked by middleware
  let role
  try {
    role = await dbAdminRole.insertRoleByClientId(req.body.client_id, req.body.name, req.body.description)
  } catch (err) {
    return next(createError(400, err))
  }
  res.status(201).send(role)
}
