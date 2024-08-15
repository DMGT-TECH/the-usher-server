const { PGPool } = require('./pg_pool')
const pool = new PGPool()
const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

const insertRolePermissionByClientId = async  (clientId, rolename, permissionname) => {
  const sql = `INSERT INTO usher.rolepermissions (rolekey, permissionkey)
  SELECT r.KEY, p.KEY
  FROM usher.roles r, usher.permissions p, usher.clients c
  WHERE r.clientkey = c.key AND c.client_id = $1 AND r.name = $2
  AND p.name = $3`
  const sqlParams = [clientId, rolename, permissionname]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Insert successful'
    } else {
      const errClientRolePermissionDoesNotExist = `Either or all of client_id = ${clientId} & rolename ${rolename}; permissionname = ${permissionname} does not exist`
      return `Insert failed: ${errClientRolePermissionDoesNotExist}`
    }
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "rolepermissions_rolekey_permissionkey_uq"') {
      const errClientRolePermissionAlreadyExists = `A client role client_id = ${clientId} & rolename ${rolename} is already assigned to permissionname ${permissionname}`
      return `Insert failed: ${errClientRolePermissionAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

const deleteRolePermissionByClientId = async (clientId, rolename, permissionname) => {
  const sql = `DELETE FROM usher.rolepermissions rp
  WHERE EXISTS (SELECT c.key FROM usher.clients c JOIN usher.roles r ON r.clientkey = c.key WHERE c.client_id = $1 AND r.name = $2 AND r.key = rp.rolekey)
  AND EXISTS (SELECT key FROM usher.permissions p WHERE p.name = $3 AND p.key = rp.permissionkey)`
  const sqlParams = [clientId, rolename, permissionname]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Either or all of client_id = ${clientId} & rolename ${rolename}; permissionname = ${permissionname} does not exist`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}

/**
 * Get permissions for a given role key.
 *
 * @param {number} roleKey - The role key.
 * @returns {Promise<Array>} - A promise that resolves to an array of permissions.
 */
const getRolePermissions = async (roleKey) => {
  try {
    return await usherDb('permissions')
      .select('permissions.key', 'permissions.name', 'permissions.description', 'permissions.clientkey')
      .join('rolepermissions', 'permissions.key', 'rolepermissions.permissionkey')
      .join('roles', 'rolepermissions.rolekey', 'roles.key')
      .where('roles.key', roleKey)
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

module.exports = {
  insertRolePermissionByClientId,
  deleteRolePermissionByClientId,
  getRolePermissions
}
