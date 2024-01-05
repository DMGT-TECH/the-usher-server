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
