const { PGPool } = require('./pg_pool')
const pool = new PGPool()

module.exports = {
  insertTenant,
  updateTenantName,
  updateTenantIssClaim,
  deleteTenant
}

async function insertTenant (tenantName, issClaim, jwksUri) {
  const sql = 'INSERT INTO usher.tenants (name, iss_claim, jwks_uri) VALUES ($1, $2, $3)'
  const sqlParams = [tenantName, issClaim, jwksUri]
  try {
    await pool.query(sql, sqlParams)
    return 'Insert successful'
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "tenants_name_uq"') {
      const errTenantAlreadyExists = `Tenant already exists matching tenantname ${tenantName}`
      return `Insert failed: ${errTenantAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

async function updateTenantName (tenantName, issClaim, newTenantName) {
  const sql = 'UPDATE usher.tenants SET name = $3 WHERE name = $1 AND iss_claim = $2'
  const sqlParams = [tenantName, issClaim, newTenantName]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Update successful'
    } else {
      return `Update failed: Tenant does not exist matching tenantname ${tenantName}`
    }
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "tenants_name_uq"') {
      const errTenantAlreadyExists = `Tenant already exists matching tenantname ${tenantName}`
      return `Insert failed: ${errTenantAlreadyExists}`
    }
    if (error.message === 'duplicate key value violates unique constraint "tenants_name_issclaim_uq"') {
      const errTenantAlreadyExists = `Tenant already exists matching iss_claim ${issClaim}`
      return `Update failed: ${errTenantAlreadyExists}`
    }
    return `Update failed: ${error.message}`
  }
}

async function updateTenantIssClaim (tenantName, issClaim, newIssClaim, newJwksUri) {
  const sql = 'UPDATE usher.tenants SET iss_claim = $3, jwks_uri = $4 WHERE name = $1 AND iss_claim = $2'
  const sqlParams = [tenantName, issClaim, newIssClaim, newJwksUri]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Update successful'
    } else {
      return `Update failed: Tenant does not exist matching tenantname ${tenantName}`
    }
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "tenants_name_issclaim_uq"') {
      const errTenantAlreadyExists = `Tenant already exists matching iss_claim ${issClaim}`
      return `Update failed: ${errTenantAlreadyExists}`
    }
    return `Update failed: ${error.message}`
  }
}

async function deleteTenant (tenantName, issClaim) {
  const sql = 'DELETE FROM usher.tenants WHERE name = $1 AND iss_claim = $2'
  const sqlParams = [tenantName, issClaim]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Tenant does not exist matching tenantname ${tenantName} or iss_claim ${issClaim}`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}
