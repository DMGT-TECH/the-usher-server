const { PGPool } = require('./pg_pool')
const pool = new PGPool()
const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

/**
 *
 * Insert a new Client into database
 *
 * @param {string} tenantName Unique tenant to associate Client to
 * @param {string} clientId The unique id for the new Client to create
 * @param {string} name Client Name
 * @param {string} description Optional description for the Client
 * @param {string} secret
 * @returns Record with the newly created object
 */
const insertClient = async (tenantName, clientId, name, description, secret) => {
  try {
    // validate tenant name and get tenant key
    let sql = 'SELECT t.key from usher.tenants t WHERE t.name = $1'
    const tenants = await pool.query(sql, [tenantName])
    if (tenants.rows.length === 0) {
      throw new Error('Invalid tenant name')
    }
    const tenantKey = tenants.rows[0].key

    // insert client record
    sql = 'INSERT INTO usher.clients (client_id, name, description, secret) VALUES ($1, $2, $3, $4) returning key'
    const results = await pool.query(sql, [clientId, name, description, secret])
    const clientKey = results.rows[0].key
    // relate client to tenant
    sql = 'INSERT INTO usher.tenantclients (tenantkey, clientkey) VALUES ($1, $2)'
    await pool.query(sql, [tenantKey, clientKey])

    // return client
    sql = 'SElECT c.client_id, c.name, c.description, c.secret FROM usher.clients c WHERE c.client_id=$1'
    const role = await pool.query(sql, [clientId])
    return role.rows[0]
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "clients_client_id_uq"') {
      const errClientAlreadyExists = `Client already exists matching client_id ${clientId}`
      return `Insert failed: ${errClientAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

/**
 * Gets a single Client object
 *
 * @param {string} clientId The Client ID
 * @returns client object
 */
const getClient = async (clientId) => {
  const sql = 'SElECT c.client_id, c.name, c.description, c.secret FROM usher.clients c WHERE c.client_id = $1'
  try {
    const results = await pool.query(sql, [clientId])
    if (results.rowCount === 0) {
      throw new Error(`No results for client_id ${clientId}`)
    }
    return results.rows[0]
  } catch (error) {
    throw error
  }
}

/**
 * Updates a client by client ID with the provided information.
 *
 * @param {string} clientId - The ID of the client to update.
 * @param {Object} clientInfo - Object containing the updated client information.
 * @param {string} clientInfo.client_id - The new client ID of the client.
 * @param {string} clientInfo.name - The new name of the client.
 * @param {string} clientInfo.description - The new description of the client.
 * @param {string} clientInfo.secret - The new secret key of the client.
 * @returns {Promise<Object>} The updated client object.
 * @throws {Error} If an error occurs while updating the client.
 */
const updateClientByClientId = async (clientId, { client_id, name, description, secret }) => {
  try {
    const [updatedClient] = await usherDb('clients')
      .where({ client_id: clientId })
      .update({
        client_id,
        name,
        description,
        secret,
      }).returning(['client_id', 'name', 'description', 'secret'])
    return updatedClient
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

const deleteClientByClientId = async (clientId) => {
  const sql = 'DELETE FROM usher.clients WHERE client_id = $1'
  try {
    const results = await pool.query(sql, [clientId])
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Client does not exist matching client_id ${clientId}`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}

module.exports = {
  insertClient,
  getClient,
  updateClientByClientId,
  deleteClientByClientId,
}
