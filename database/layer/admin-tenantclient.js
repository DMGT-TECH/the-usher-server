const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

/**
 * Inserts a new tenant-client relationship into the database.
 * @param {string} tenantName Name of existing tenant
 * @param {string} issClaim Issuer claim of the tenant
 * @param {string} clientId ID of an existing client
 * @returns {Promise<Object>} A promise that resolves to the inserted tenant-client relationship object
 */
const insertTenantClient = async (tenantName, issClaim, clientId) => {
  try {
    const tenant = await usherDb('tenants').where({ name: tenantName, iss_claim: issClaim }).first('key')
    if (!tenant) {
      throw new Error(`Tenant with name ${tenantName} not found`)
    }
    const client = await usherDb('clients').where({ client_id: clientId }).first('key')
    if (!client) {
      throw new Error(`Client with id ${clientId} not found`)
    }

    const [tenantClient] = await usherDb('tenantclients')
      .insert({
        tenantkey: tenant.key,
        clientkey: client.key
      })
      .returning('*')

    return tenantClient
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

/**
 * Deletes a tenant-client relationship from the database.
 * @param {string} tenantName Name of existing tenant
 * @param {string} issClaim Issuer claim of the tenant
 * @param {string} clientId ID of an existing client
 * @returns {Promise<number>} Number of deleted rows
 */
const deleteTenantClient = async (tenantName, issClaim, clientId) => {
  try {
    const deletedCount = await usherDb('tenantclients')
      .whereExists(function() {
        this.select('key').from('tenants')
        .whereRaw('tenants.key = tenantclients.tenantkey')
        .andWhereRaw('tenants.name=?', [tenantName])
        .andWhereRaw('tenants.iss_claim=?', [issClaim])
      })
      .whereExists(function() {
        this.select('key').from('clients')
        .whereRaw('clients.key = tenantclients.clientkey')
        .andWhereRaw('clients.client_id=?', [clientId])
      })
      .del()

    return deletedCount
  } catch(error) {
    throw pgErrorHandler(error)
  }
}

module.exports = {
  insertTenantClient,
  deleteTenantClient
}
