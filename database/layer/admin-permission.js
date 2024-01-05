const { PGPool } = require('./pg_pool')
const pool = new PGPool()
const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

const insertPermissionByClientId = async (clientId, permissionname, permissiondescription) => {
  const sql = 'INSERT INTO usher.permissions (clientkey, name, description) SELECT key, $1, $2 FROM usher.clients WHERE client_id = $3'
  const sqlParams = [permissionname, permissiondescription, clientId]
  try {
    await pool.query(sql, sqlParams)
    return 'Insert successful'
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "permissions_name_clientkey_uq"') {
      const errClientPermissionAlreadyExists = `A permission ${permissionname} already exists matching client_id`
      return `Insert failed: ${errClientPermissionAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

const updatePermissionByPermissionname = async (clientId, permissionname, permissiondescription) => {
  const sql = 'UPDATE usher.permissions p SET description = $1 WHERE EXISTS (SELECT 1 FROM usher.clients c WHERE c.client_id = $2) AND p.name = $3'
  const sqlParams = [permissiondescription, clientId, permissionname]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Update successful'
    } else {
      return `Update failed: Permission does not exist matching permissionname ${permissionname} on client ${clientId}`
    }
  } catch (error) {
    return `Update failed: ${error.message}`
  }
}

const deletePermissionByPermissionname = async (clientId, permissionname) => {
  const sql = 'DELETE FROM usher.permissions p WHERE EXISTS (SELECT 1 FROM usher.clients c WHERE c.client_id = $1) AND p.name = $2'
  const sqlParams = [clientId, permissionname]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Permission does not exist matching permissionname ${permissionname} on client_id ${clientId}`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}

/**
 * Retrieve a permission by its key
 *
 * @param {number} permissionKey - The permission key
 * @returns {Promise<Object>} - A promise that resolves to the retrieved permission object
 */
const getPermission = async (permissionKey) => {
  try {
    return await usherDb('permissions').where({ key: permissionKey }).returning('*').first()
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

module.exports = {
  insertPermissionByClientId,
  updatePermissionByPermissionname,
  deletePermissionByPermissionname,
  getPermission,
}
