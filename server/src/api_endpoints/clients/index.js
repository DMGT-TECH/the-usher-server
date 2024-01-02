const createError = require('http-errors')
const dbAdminRole = require('database/layer/admin-client')

/**
 * Client Admin function to create a Client
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
 const createClient = async (req, res, next) => {
  const {
    tenant_name: tenantName,
    client_id: clientId,
    name,
    description,
    secret
  } = req.body

  try {
    const client = await dbAdminRole.insertClient(tenantName, clientId, name, description, secret)
    // change error handling to thrown exception
    if (!client?.client_id) {
      throw new Error(`Error creating client: ${client}`)
    }

    res.status(201).send({
      client_id: client.client_id,
      clientname: client.name,
      description: client.description || '',
      secret: client.secret
    })
  } catch (err) {
    return next(createError(500, err))
  }
}

const deleteClient = async (req, res, next) => {
  const clientId = req.params.client_id

  try {
    const result = await dbAdminRole.deleteClientByClientId(clientId)
    if (result != 'Delete successful') {
      throw new Error(`Error deleting Client ${clientId}`)
    }
    res.status(204).send()
  } catch (err) {
    return next(createError(404, err))
  }
}

const getClient = async (req, res, next) => {
  const clientId = req.params.client_id

  try {
    const client = await dbAdminRole.getClient(clientId)
    res.send({
      client_id: client.client_id,
      clientname: client.name,
      description: client.description || '',
      secret: client.secret
    })
  } catch (err) {
    return next(createError(404, err))
  }
}

module.exports = {
  createClient,
  deleteClient,
  getClient
}
