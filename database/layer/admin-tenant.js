const { pgErrorHandler } = require('../utils/pgErrorHandler')
const { usherDb } = require('./knex')
const { PGPool } = require('./pg_pool')
const pool = new PGPool()

/**
 * Insert a new tenant into the database
 * @param {string} tenantName
 * @param {string} issClaim
 * @param {string} jwksUri
 * @returns {Promise<object>} A promise that resolves to the inserted tenant object
 */
const insertTenant = async (tenantName, issClaim, jwksUri) => {
  try {
    const [tenant] = await usherDb('tenants')
      .insert({
        name: tenantName,
        iss_claim: issClaim,
        jwks_uri: jwksUri
      })
      .returning('*')

      return tenant
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

const updateTenantName = async (tenantName, issClaim, newTenantName) => {
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

const updateTenantIssClaim = async (tenantName, issClaim, newIssClaim, newJwksUri) => {
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

/**
 * Delete a tenant by its name and iss_claim
 * @param {string} tenantName
 * @param {string} issClaim
 * @returns {Promise<number>} - A promise that resolves to the number of deleted rows
 */
const deleteTenant = async (tenantName, issClaim) => {
  try {
    const deletedCount = await usherDb('tenants')
      .where('name', tenantName)
      .andWhere('iss_claim', issClaim)
      .del()

    return deletedCount
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

/**
 * Get tenants by optional filters
 *
 * @param {Object} filters - The filters to apply
 * @param {number} [filters.key] - The tenant key
 * @param {string} [filters.name] - The name of tenant
 * @param {string} [filters.iss_claim] - The iss_claim of tenant
 * @param {string} [sort='name'] - The column to sort by
 * @param {string} [order='desc'] - The order of sorting (asc or desc)
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of tenants
 */
const getTenants = async (filters = {}, sort = 'key', order = 'desc') => {
  try {
    const query = usherDb('tenants').select('*')

    const { key, name, iss_claim } = filters
    if (key) {
      query.where('tenants.key', key)
    }
    if (iss_claim) {
      query.where('tenants.iss_claim', 'ilike', `%${iss_claim}%`)
    }
    if (name) {
      query.where('tenants.name', 'ilike', `%${name}%`)
    }

    query.orderBy(sort, order)

    const tenants = await query
    return tenants
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

module.exports = {
  insertTenant,
  updateTenantName,
  updateTenantIssClaim,
  deleteTenant,
  getTenants,
}
