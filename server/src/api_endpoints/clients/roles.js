const createError = require('http-errors')
const dbAdminRole = require('database/layer/admin-role')

module.exports = {
  listClientRoles,
  createClientRole
}

/**
 * Client Admin function to get a list of Roles for given Client
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function listClientRoles (req, res, next) {
  const clientId = req.params.client_id

  const roles = await dbAdminRole.listRoles(clientId)
  res.status(200).send({ data: roles })
}

/**
 * Client Admin function to create a new Role and link to given Client
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function createClientRole (req, res, next) {
  const clientId = req.params.client_id
  const name = req.body.name
  const description = req.body.description

  try {
    const role = await dbAdminRole.insertRoleByClientId(clientId, name, description)
    res.status(201).send(role)
  } catch (err) {
    return next(createError(500, err))
  }
}
