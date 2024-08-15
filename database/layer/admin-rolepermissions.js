const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

const insertRolePermissionByClientId = async (clientId, rolename, permissionname) => {
  const sql = `
    INSERT INTO usher.rolepermissions (rolekey, permissionkey)
    SELECT r.KEY, p.KEY
    FROM usher.roles r, usher.permissions p, usher.clients c
    WHERE r.clientkey = c.key AND c.client_id = ? AND r.name = ? AND p.name = ?`
  const sqlParams = [clientId, rolename, permissionname]
  try {
    const results = await usherDb.raw(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Insert successful'
    } else {
      const errClientRolePermissionDoesNotExist = `Either or all of client_id = ${clientId} & rolename ${rolename}; permissionname = ${permissionname} does not exist`
      return `Insert failed: ${errClientRolePermissionDoesNotExist}`
    }
  } catch (error) {
    if (error.message.includes('duplicate key value violates unique constraint')) {
      const errClientRolePermissionAlreadyExists = `A client role client_id = ${clientId} & rolename ${rolename} is already assigned to permissionname ${permissionname}`
      return `Insert failed: ${errClientRolePermissionAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

const deleteRolePermissionByClientId = async (clientId, rolename, permissionname) => {
  const sql = `
    DELETE FROM usher.rolepermissions rp
    WHERE EXISTS (
      SELECT c.key 
      FROM usher.clients c 
      JOIN usher.roles r ON r.clientkey = c.key 
      WHERE c.client_id = ? AND r.name = ? AND r.key = rp.rolekey
    )
    AND EXISTS (
      SELECT key 
      FROM usher.permissions p 
      WHERE p.name = ? AND p.key = rp.permissionkey
    )`
  const sqlParams = [clientId, rolename, permissionname]
  try {
    const results = await usherDb.raw(sql, sqlParams)
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
