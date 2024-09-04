const { usherDb } = require('./knex')

/**
 *
 * @param {string} issClaim ISS Claim to look up tenant by
 * @returns
 */
async function selectIssuerJWKS (issClaim) {
  try {
    const results = await usherDb('tenants')
      .select('name as tenantname', 'iss_claim', 'jwks_uri')
      .where('iss_claim', issClaim)
      .limit(1)
    return results
  } catch (error) {
    throw error.message
  }
}

/**
 * Get a list of clients, if clientId is not provided, return all clients
 * @param {*} clientId
 * @returns
 */
async function selectClients (clientId = '*') {
  try {
    const results = await usherDb('clients')
      .select('client_id', 'name as clientname', 'description', 'secret')
      .modify((queryBuilder) => {
        if (clientId !== '*') {
          queryBuilder.where('client_id', clientId)
        }
      })
    return results
  } catch (error) {
    throw error.message
  }
}

module.exports = {
  selectIssuerJWKS,
  selectClients
}
