const { PGPool } = require('./pg_pool')
const pool = new PGPool()

module.exports = {
  insertGroupRole,
  deleteGroupRole
}

async function insertGroupRole (groupname, clientId, rolename) {
  const sql = `INSERT INTO usher.grouproles (groupkey, rolekey)
  SELECT g.KEY, r.KEY
  FROM usher.roles r, usher.groups g, usher.clients c
  WHERE g.name = $1
  AND r.clientkey = c.key AND c.client_id = $2 AND r.name = $3`
  const sqlParams = [groupname, clientId, rolename]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Insert successful'
    } else {
      const errGroupRoleDoesNotExist = `Either or all of client_id = ${clientId} & rolename ${rolename}; groupname = ${groupname} does not exist`
      return `Insert failed: ${errGroupRoleDoesNotExist}`
    }
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "grouproles_groupkey_rolekey_uq"') {
      const errGroupRoleAlreadyExists = `A client role client_id = ${clientId} & rolename ${rolename} is already assigned to groupname ${groupname}`
      return `Insert failed: ${errGroupRoleAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

async function deleteGroupRole (groupname, clientId, rolename) {
  const sql = `DELETE FROM usher.grouproles gr
  WHERE EXISTS (SELECT key FROM usher.groups g WHERE g.name = $1 AND g.key = gr.groupkey)
  AND EXISTS (SELECT c.key FROM usher.clients c JOIN usher.roles r ON r.clientkey = c.key WHERE c.client_id = $2 AND r.name = $3 AND r.key = gr.rolekey)`
  const sqlParams = [groupname, clientId, rolename]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Either or all of client_id = ${clientId} & rolename ${rolename}; groupname = ${groupname} does not exist`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}
