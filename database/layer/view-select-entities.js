const { PGPool } = require('./pg_pool')
const pool = new PGPool()

function getTenantsView () {
  return `SELECT t.name AS tenantname, t.iss_claim, t.jwks_uri
            FROM usher.tenants t`
}
async function selectIssuerJWKS (issClaim = '*') {
  try {
    let sql = getTenantsView() + ' where 1=1'
    const params = []
    let paramCount = 0
    if (issClaim !== '*') {
      params.push(issClaim)
      paramCount++
      sql += ' and iss_claim = $' + paramCount
    }
    sql += ' LIMIT 1'
    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

async function selectClients (clientId = '*') {
  try {
    let sql = `SELECT c.client_id, c.name as clientname, c.description, c.secret
      FROM usher.clients c where 1=1 `
    const params = []
    let paramCount = 0
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' and client_id = $' + paramCount
    }
    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

module.exports = {
  selectIssuerJWKS,
  selectClients
}
