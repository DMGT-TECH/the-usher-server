const { PGPool } = require('./pg_pool')
const pool = new PGPool()
const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

const insertPersonaPermissionByClientId = async (clientId, subClaim, permissionName) => {
  const sql = `INSERT INTO usher.personapermissions (personakey, permissionkey)
  SELECT prs.KEY, pm.KEY
  FROM usher.permissions pm
    INNER JOIN usher.clients c on (c.key = pm.clientkey)
    INNER JOIN usher.tenantclients tc on (c.key = tc.clientkey)
    INNER JOIN usher.tenants t on (t.key = tc.tenantkey)
    INNER JOIN usher.personas prs on (prs.tenantkey = t.key)
  WHERE c.client_id = $1
    AND prs.sub_claim = $2
    AND pm.name = $3`
  const sqlParams = [clientId, subClaim, permissionName]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Insert successful'
    } else {
      const errClientPersonaPermissionDoesNotExist = `Either or all of client_id = ${clientId}; persona = ${subClaim}; permission = ${permissionName}; does not exist.`
      return `Insert failed: ${errClientPersonaPermissionDoesNotExist}`
    }
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "personapermissions_personakey_permissionkey_uq"') {
      const errClientPersonaPermissionAlreadyExists = `A persona permission client_id = ${clientId}; persona ${subClaim}; is already assigned to permission ${permissionName}.`
      return `Insert failed: ${errClientPersonaPermissionAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

const deletePersonaPermissionByClientId = async (clientId, subClaim, permissionName) => {
  const sql = `DELETE FROM usher.personapermissions pp
  WHERE
    EXISTS (SELECT c.key
      FROM usher.clients c
      JOIN usher.permissions pm ON pm.clientkey = c.key WHERE  c.client_id = $1 AND pm.name = $3)
    AND
    EXISTS (SELECT prs.key FROM usher.personas prs WHERE prs.KEY = pp.personakey AND prs.sub_claim = $2)`
  const sqlParams = [clientId, subClaim, permissionName]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Either or all of client_id = ${clientId}; persona ${subClaim}; permission = ${permissionName}; does not exist.`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}

/**
 * Get persona permissions for a given persona key.
 * 
 * @param {number} personaKey - The persona key.
 * @returns {Promise<Array>} - A promise that resolves to an array of persona permissions.
 */
const getPersonaPermissions = async (personaKey) => {
  try {
    return await usherDb('permissions')
      .select('permissions.key', 'permissions.name', 'permissions.description', 'permissions.clientkey')
      .join('personapermissions', 'permissions.key', 'personapermissions.permissionkey')
      .join('personas', 'personapermissions.personakey', 'personas.key')
      .where('personas.key', personaKey)
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

/**
 * Insert multiple records for persona permissions
 *
 * @param {number} personaKey - The persona key
 * @param {number[]} permissionKeys - An array of permission keys
 * @returns {Promise<Object[]>} - A promise that resolves to an array of inserted personapermissions records
 */
const insertPersonaPermissions = async (personaKey, permissionKeys) => {
  try {
    const personaPermissions = permissionKeys.map((permissionkey) => {
      return {
        personakey: personaKey,
        permissionkey
      }
    })
    return await usherDb('personapermissions').insert(personaPermissions).returning('*')
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

/**
 * Delete persona permissions for a specific persona and permission key
 *
 * @param {number} personaKey - The persona key
 * @param {number} permissionKey - The permission key
 * @returns {Promise<number>} - A promise that resolves to the number of deleted records
 */
const deletePersonaPermissions = async (personaKey, permissionKey) => {
  try {
    return await usherDb('personapermissions').where({ personakey: personaKey, permissionkey: permissionKey }).del()
  } catch (err) {
    console.log(err)
    throw pgErrorHandler(err)
  }
}

module.exports = {
  insertPersonaPermissionByClientId,
  deletePersonaPermissionByClientId,
  insertPersonaPermissions,
  deletePersonaPermissions,
  getPersonaPermissions,
}
