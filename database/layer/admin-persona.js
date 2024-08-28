const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

const insertPersona = async (tenantName, issClaim, subClaim, userContext) => {
  const sql = `INSERT INTO usher.personas (tenantkey, sub_claim, user_context)
  SELECT key, ?, ?
  FROM usher.tenants
  WHERE name = ? AND iss_claim = ?`
  const sqlParams = [subClaim, userContext, tenantName, issClaim]
  try {
    const results = await usherDb.raw(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Insert successful'
    } else {
      const errTenantDoesNotExist = `Tenant does not exist matching tenantname ${tenantName} iss_claim ${issClaim}`
      return `Insert failed: ${errTenantDoesNotExist}`
    }
  } catch (error) {
    if (error.message.includes('duplicate key value violates unique constraint "personas_subclaim_userscope_tenantkey_uq"')) {
      const errPersonaAlreadyExists = `A persona (sub_claim = ${subClaim}; user_context = ${userContext}) already exists on tenantname ${tenantName} iss_claim ${issClaim}`
      return `Insert failed: ${errPersonaAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

const deletePersona = async (tenantName, issClaim, subClaim, userContext) => {
  const sql = `DELETE FROM usher.personas p
    WHERE EXISTS (SELECT 1 FROM usher.tenants t WHERE t.KEY = p.tenantkey AND t.name = ? and t.iss_claim = ?)
    AND p.sub_claim = ? AND p.user_context = ?`
  const sqlParams = [tenantName, issClaim, subClaim, userContext]
  try {
    const deleteResult = await usherDb.raw(sql, sqlParams)
    if (deleteResult.rowCount === 1) {
      return 'Delete successful'
    } else {
      const errPersonaDoesNoteExist = `A persona (sub_claim = ${subClaim}; user_context = ${userContext}) does not exist on tenantname ${tenantName} iss_claim ${issClaim}`
      return `Delete failed: ${errPersonaDoesNoteExist}`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}

const updatePersona = async (tenantName, issClaim, oldSubClaim, newSubClaim, oldUserContext, newUserContext) => {
  const sql = `UPDATE usher.personas p SET sub_claim = ?, user_context = ?
    WHERE EXISTS (SELECT 1 FROM usher.tenants t WHERE t.KEY = p.tenantkey AND t.name = ? and t.iss_claim = ?)
    AND p.sub_claim = ? AND p.user_context = ?`
  const sqlParams = [newSubClaim, newUserContext, tenantName, issClaim, oldSubClaim, oldUserContext]
  try {
    const updateResult = await usherDb.raw(sql, sqlParams)
    if (updateResult.rowCount === 1) {
      return 'Update successful'
    } else {
      const errPersonaDoesNotExist = `Update failed: A persona (sub_claim = ${oldSubClaim}; user_context = ${oldUserContext}) does not exist on tenantname ${tenantName} iss_claim ${issClaim}`
      return errPersonaDoesNotExist
    }
  } catch (error) {
    return `Update failed: ${error.message}`
  }
}

const insertPersonaByTenantKey = async (tenantKey, subClaim, userContext = '') => {
  try {
    const [persona] = await usherDb('personas')
      .insert({ tenantkey: tenantKey, sub_claim: subClaim, user_context: userContext })
      .returning(['key', 'sub_claim', 'tenantkey', 'user_context', 'created_at'])
    return persona
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

/**
 * Get persona by personaKey
 *
 * @param {number} personaKey - The persona key
 * @returns {Promise<Object>} - A promise that resolves to the persona object with matching personaKey
 */
const getPersona = async (personaKey) => {
  try {
    return await usherDb('personas').select('*').where({ key: personaKey }).first()
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

/**
 * Delete a persona record by persona key
 *
 * @param {number} personaKey - The persona key to delete
 * @returns {Promise<number>} - A promise that resolves to the number of deleted records
 */
const deletePersonaByKey = async (personaKey) => {
  try {
    return await usherDb('personas').where({ key: personaKey }).del()
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

/**
 * Retrieve a list of personas based on filter criteria
 *
 * @param {Object} filterQuery - The filter query to apply (optional)
 * @param {string} sort - The field to sort by (default: 'key')
 * @param {string} order - The sort order ('asc' or 'desc', default: 'asc')
 * @returns {Promise<Array>} - A promise that resolves to an array of personas with tenantname
 * @throws {Error} - If there is an error during the retrieval process
 */
const getPersonas = async (filterQuery = {}, sort = 'key', order = 'asc') => {
  try {
    const tenantNameKey = 'tenantname'
    const filters = Object.entries(filterQuery).reduce((acc, [key, val]) => {
      if (key === tenantNameKey) {
        acc.name = filterQuery[tenantNameKey]
      } else {
        acc[`personas.${key}`] = val
      }
      return acc
    }, {})
    return await usherDb('personas')
      .select('personas.*', `tenants.name as ${tenantNameKey}`)
      .join('tenants', 'personas.tenantkey', 'tenants.key')
      .where(filters)
      .orderBy(sort, order)
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

module.exports = {
  insertPersona,
  deletePersona,
  updatePersona,
  insertPersonaByTenantKey,
  getPersona,
  deletePersonaByKey,
  getPersonas,
}
