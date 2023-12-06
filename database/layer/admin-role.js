const { PGPool } = require('./pg_pool')
const pool = new PGPool()

module.exports = {
  insertRoleByClientId,
  updateRoleByClientRolename,
  deleteRoleByClientRolename,
  getRole,
  listRoles
}

async function insertRoleByClientId (clientId, rolename, roledescription) {
  let sql = 'INSERT INTO usher.roles (clientkey, name, description) SELECT key, $1, $2 FROM usher.clients WHERE client_id = $3'
  try {
    const results = await pool.query(sql, [rolename, roledescription, clientId])
    if (results.rowCount === 1) {
      sql = 'SElECT r.key, r.clientkey, r.name, r.description FROM usher.roles r inner join usher.clients c on (r.clientkey=c.key AND c.client_id=$1) WHERE r.name=$2'
      const role = await pool.query(sql, [clientId, rolename])
      return role.rows[0]
    } else {
      throw new Error(`Client does not exist matching client_id ${clientId}`)
    }
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "roles_name_clientkey_uq"') {
      const errClientRoleAlreadyExists = `A role ${rolename} already exists matching client_id ${clientId}`
      return errClientRoleAlreadyExists
    }
    return error.message
  }
}

async function updateRoleByClientRolename (clientId, rolename, roledescription) {
  const sql = 'UPDATE usher.roles r SET description = $1 WHERE EXISTS (SELECT 1 FROM usher.clients c WHERE c.client_id = $2) AND r.name = $3'
  const sqlParams = [roledescription, clientId, rolename]
  try {
    const updateResult = await pool.query(sql, sqlParams)
    if (updateResult.rowCount === 1) {
      return 'Update successful'
    } else {
      return `Update failed: Role does not exist matching rolename ${rolename} on client ${clientId}`
    }
  } catch (error) {
    return `Update failed: ${error.message}`
  }
}

/**
 * Gets a single Role object
 *
 * @param {number} key The Role primary key
 * @returns Role object
 */
async function getRole (key) {
  const sql = 'SELECT r.* FROM usher.roles r WHERE r.key = $1'
  const results = await pool.query(sql, [key])
  return results.rows[0]
}

async function deleteRoleByClientRolename (clientId, rolename) {
  const sql = 'DELETE FROM usher.roles r WHERE EXISTS (SELECT 1 FROM usher.clients c WHERE c.client_id = $1) AND r.name = $2'
  const sqlParams = [clientId, rolename]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Rolename ${rolename} does not exist matching client_id ${clientId}`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}

/**
 * Gets a list of Roles
 * NOTE: This currently joins with tenants so same role can be returned multiple times
 *
 * @param {string} [clientId] Optional client_id to filter list of Roles belonging to given Client
 * @returns Array of Role objects with associated extra fields from tenants, clients
 */
async function listRoles (clientId) {
  const params = []
  let sql = `SELECT t.name AS tenantname, t.iss_claim AS iss_claim,
        c.client_id AS client_id, r.key, r.clientkey, r.name, r.description
        FROM usher.roles r
        JOIN usher.clients c ON (c.key = r.clientkey)
        JOIN usher.tenantclients tc ON (c.key = tc.clientkey)
        JOIN usher.tenants t ON (t.key = tc.tenantkey)
        WHERE 1=1 `
  if (clientId) {
    sql += ' and c.client_id = $1'
    params.push(clientId)
  }

  const roles = await pool.query(sql, params)
  return roles.rows
}
