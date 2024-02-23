const createError = require('http-errors')
const dbAdminRole = require('database/layer/admin-client')
const { checkClientExists } = require('./utils')

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
      name: client.name,
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
      name: client.name,
      description: client.description || '',
      secret: client.secret
    })
  } catch (err) {
    return next(createError(404, err))
  }
}

/**
 * HTTP Request handler
 * Update a client by client_id
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object to send 200 statusCode and updated client on success
 * @param {Function} next - The next middleware function
 * @returns {Promise<void>} - A promise that resolves to void when client is updated
 */
const updateClient = async (req, res, next) => {
  try {
    const { client_id: clientId } = req.params
    await checkClientExists(clientId)
    const updatedClient = await dbAdminRole.updateClientByClientId(clientId, req.body)
    res.status(200).send(updatedClient)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  createClient,
  deleteClient,
  getClient,
  updateClient,
}
