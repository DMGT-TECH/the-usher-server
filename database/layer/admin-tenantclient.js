const { PGPool } = require('./pg_pool')
const pool = new PGPool()

module.exports = {
  insertTenantClient,
  deleteTenantClient
}

async function insertTenantClient (tenantName, issClaim, clientId) {
  const sql = `INSERT INTO usher.tenantclients (tenantkey, clientkey)
  SELECT t.KEY, c.KEY
  FROM usher.tenants t, usher.clients c
  WHERE t.name = $1 and t.iss_claim = $2
  AND c.client_id = $3`
  const sqlParams = [tenantName, issClaim, clientId]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Insert successful'
    } else {
      const errTenantClientDoesNotExist = `Either or both of client_id = ${clientId}; tenantname = ${tenantName} iss_claim = ${issClaim} does not exist`
      return `Insert failed: ${errTenantClientDoesNotExist}`
    }
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "tenantclients_tenantkey_clientkey_uq"') {
      const errTenantClientAlreadyExists = `client_id = ${clientId} already exists on tenantname = ${tenantName} iss_claim = ${issClaim}`
      return `Insert failed: ${errTenantClientAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

async function deleteTenantClient (tenantName, issClaim, clientId) {
  const sql = `DELETE FROM usher.tenantclients AS tc
  WHERE EXISTS (SELECT key FROM usher.tenants t WHERE t.key = tc.tenantkey AND t.name = $1 AND t.iss_claim = $2)
  AND EXISTS (SELECT key FROM usher.clients c WHERE c.key = tc.clientkey AND c.client_id = $3)`
  const sqlParams = [tenantName, issClaim, clientId]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      const errTenantClientDoesNotExist = `Either or both of client_id = ${clientId}; tenantname = ${tenantName} iss_claim = ${issClaim} does not exist`
      return `Delete failed: ${errTenantClientDoesNotExist}`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}
