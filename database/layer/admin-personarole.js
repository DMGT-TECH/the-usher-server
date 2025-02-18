const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

const insertPersonaRole = async (tenantName, issClaim, subClaim, userContext, clientId, rolename) => {
  const sql = `INSERT INTO usher.personaroles (personakey, rolekey)
  SELECT p.KEY, r.KEY
  FROM usher.roles r JOIN usher.clients c ON (c.key = r.clientkey) inner join usher.tenantclients tc ON (c.key = tc.clientkey) inner JOIN usher.tenants t ON (t.key = tc.tenantkey) inner join usher.personas p on (p.tenantkey = t.key)
  WHERE t.name = ? AND t.iss_claim = ? AND p.sub_claim = ? AND p.user_context = ?
  AND c.client_id = ? AND r.name = ?`
  const sqlParams = [tenantName, issClaim, subClaim, userContext, clientId, rolename]
  try {
    const results = await usherDb.raw(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Insert successful'
    } else {
      const errPersonaRoleDoesNotExist = `Either or all of client_id = ${clientId} & rolename ${rolename}; tenantname = ${tenantName} & iss_claim = ${issClaim} & sub_claim = ${subClaim} & user_context = ${userContext} does not exist`
      return `Insert failed: ${errPersonaRoleDoesNotExist}`
    }
  } catch (error) {
    if (error.message.includes('duplicate key value violates unique constraint "personaroles_personakey_rolekey_uq"')) {
      const errPersonaRoleAlreadyExists = `A client role client_id = ${clientId} & rolename ${rolename} is already assigned to tenantname = ${tenantName} & iss_claim = ${issClaim} & sub_claim = ${subClaim} & user_context = ${userContext}`
      return `Insert failed: ${errPersonaRoleAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

const deletePersonaRole = async (tenantName, issClaim, subClaim, userContext, clientId, rolename) => {
  const sql = `DELETE FROM usher.personaroles
    WHERE (personakey, rolekey) IN (
      SELECT p.KEY, r.KEY
      FROM usher.roles r
        JOIN usher.clients c ON (c.key = r.clientkey)
        JOIN usher.tenantclients tc ON (c.key = tc.clientkey)
        JOIN usher.tenants t ON (t.key = tc.tenantkey)
        JOIN usher.personas p ON (p.tenantkey = t.key)
      WHERE t.name = ?
        AND t.iss_claim = ?
        AND p.sub_claim = ?
        AND p.user_context = ?
        AND c.client_id = ?
        AND r.name = ?
    );`
  const sqlParams = [tenantName, issClaim, subClaim, userContext, clientId, rolename]
  try {
    const results = await usherDb.raw(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Either or all of client_id = ${clientId} & rolename ${rolename}; tenantname = ${tenantName} & iss_claim = ${issClaim} & sub_claim = ${subClaim} & user_context = ${userContext} does not exist`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}

/**
 * Get persona roles for a given persona key.
 *
 * @param {number} personaKey - The persona key.
 * @returns {Promise<Array>} - A promise that resolves to an array of roles.
 */
const getPersonaRoles = async (personaKey) => {
  try {
    return await usherDb('roles')
      .select('roles.key', 'roles.name', 'roles.description', 'roles.clientkey', 'personaroles.created_at as assigned_at') 
      .join('personaroles', 'roles.key', 'personaroles.rolekey')
      .join('personas', 'personaroles.personakey', 'personas.key')
      .where('personas.key', personaKey)
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

/**
 * Retrieves roles for the persona within the same tenant
 *
 * @param {number} personaKey - The key of the persona
 * @param {Array<number>} roleKeys - An array of role keys
 * @returns {Promise<Roles>} - A promise that resolves with the retrieved roles
 * @throws {Error} - If there's an error during the database operation.
 */
const selectPersonaRolesInTheSameTenant = async (personaKey, roleKeys) => {
  try {
    const roles = await usherDb('roles as r')
      .select('r.*')
      .join('clients as c', 'r.clientkey', '=', 'c.key')
      .join('tenantclients as tc', 'c.key', '=', 'tc.clientkey')
      .whereExists(function () {
        this.select('p.tenantkey')
          .from('personas as p')
          .whereRaw('p.key = ?', personaKey)
          .andWhereRaw('tc.tenantkey = p.tenantkey')
      })
      .whereIn('r.key', roleKeys)
    return roles
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

/**
 * Insert multiple records for persona roles and ignore conflicts
 * This means if several roles are inserted and some of them already exist,
 * the existing records will **not** be returned in the Promise results
 *
 * @param {number} personaKey - The persona key
 * @param {number[]} roleKeys - An array of role keys
 * @returns {Promise<Object[]>} - A promise that resolves to an array of inserted personaroles records
 */
const insertPersonaRoles = async (personaKey, roleKeys) => {
  try {
    const personaRoles = roleKeys.map((rolekey) => {
      return {
        personakey: personaKey,
        rolekey,
      }
    })
    return await usherDb('personaroles')
      .insert(personaRoles)
      .onConflict(['personakey', 'rolekey'])
      .ignore()
      .returning('*')
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

/**
 * Delete a personaroles record
 *
 * @param {number} personaKey - The persona key
 * @param {number} roleKey - The role key
 * @returns {Promise<number>} - A promise that resolves to the number of deleted records
 */
const deletePersonaRoleByKeys = async (personaKey, roleKey) => {
  try {
    return await usherDb('personaroles').where({ personakey: personaKey, rolekey: roleKey }).del()
  } catch (err) {
    console.log(err)
    throw pgErrorHandler(err)
  }
}

module.exports = {
  insertPersonaRole,
  deletePersonaRole,
  getPersonaRoles,
  selectPersonaRolesInTheSameTenant,
  insertPersonaRoles,
  deletePersonaRoleByKeys,
}
