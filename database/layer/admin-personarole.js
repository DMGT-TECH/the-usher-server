const { PGPool } = require('./pg_pool')
const pool = new PGPool()

module.exports = {
  insertPersonaRole,
  deletePersonaRole
}

async function insertPersonaRole (tenantName, issClaim, subClaim, userContext, clientId, rolename) {
  const sql = `INSERT INTO usher.personaroles (personakey, rolekey)
  SELECT p.KEY, r.KEY
  FROM usher.roles r JOIN usher.clients c ON (c.key = r.clientkey) inner join usher.tenantclients tc ON (c.key = tc.clientkey) inner JOIN usher.tenants t ON (t.key = tc.tenantkey) inner join usher.personas p on (p.tenantkey = t.key)
  WHERE t.name = $1 AND t.iss_claim = $2 AND p.sub_claim = $3 AND p.user_context = $4
  AND c.client_id = $5 AND r.name = $6`
  const sqlParams = [tenantName, issClaim, subClaim, userContext, clientId, rolename]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Insert successful'
    } else {
      const errPersonaRoleDoesNotExist = `Either or all of client_id = ${clientId} & rolename ${rolename}; tenantname = ${tenantName} & iss_claim = ${issClaim} & sub_claim = ${subClaim} & user_context = ${userContext} does not exist`
      return `Insert failed: ${errPersonaRoleDoesNotExist}`
    }
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "personaroles_personakey_rolekey_uq"') {
      const errPersonaRoleAlreadyExists = `A client role client_id = ${clientId} & rolename ${rolename} is already assigned to tenantname = ${tenantName} & iss_claim = ${issClaim} & sub_claim = ${subClaim} & user_context = ${userContext}`
      return `Insert failed: ${errPersonaRoleAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

async function deletePersonaRole (tenantName, issClaim, subClaim, userContext, clientId, rolename) {
  const sql = `DELETE FROM usher.personaroles
    WHERE (personakey, rolekey) IN (
      SELECT p.KEY, r.KEY
      FROM usher.roles r
        JOIN usher.clients c ON (c.key = r.clientkey)
        JOIN usher.tenantclients tc ON (c.key = tc.clientkey)
        JOIN usher.tenants t ON (t.key = tc.tenantkey)
        JOIN usher.personas p ON (p.tenantkey = t.key)
      WHERE t.name = $1
        AND t.iss_claim = $2
        AND p.sub_claim = $3
        AND p.user_context = $4
        AND c.client_id = $5
        AND r.name = $6
    );`
  const sqlParams = [tenantName, issClaim, subClaim, userContext, clientId, rolename]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Either or all of client_id = ${clientId} & rolename ${rolename}; tenantname = ${tenantName} & iss_claim = ${issClaim} & sub_claim = ${subClaim} & user_context = ${userContext} does not exist`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}
