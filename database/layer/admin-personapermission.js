const { PGPool } = require('./pg_pool')
const pool = new PGPool()

module.exports = {
  insertPersonaPermissionByClientId,
  deletePersonaPermissionByClientId
}
async function insertPersonaPermissionByClientId (clientId, subClaim, permissionName) {
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

async function deletePersonaPermissionByClientId (clientId, subClaim, permissionName) {
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
