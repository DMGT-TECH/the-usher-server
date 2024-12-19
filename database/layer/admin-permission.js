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

/**
 * Retrieve a list of permissions by role key
 *
 * @param {number} roleKey - The role key
 * @returns {Promise<Array<Object>>} - A promise that resolves to the list of permission objects associated with the role
 */
const getPermissionsByRoleKey = async (roleKey) => {
  try {
    return await usherDb('permissions')
      .join('rolepermissions', 'permissions.key', '=', 'rolepermissions.permissionkey')
      .where({ 'rolepermissions.rolekey': roleKey })
      .select('permissions.*')
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

/**
 * Insert a new permission
 *
 * @param {Object} permissionObject - The data for the new permission
 * @param {string} permissionObject.name - The name of permission
 * @param {number} permissionObject.clientkey - A valid client key
 * @param {string} permissionObject.description - A description of the permission
 * @returns {Promise<Object>} - A promise that resolves to the inserted permission object
 */
const insertPermission = async (permissionObject) => {
  try {
    const [permission] = await usherDb('permissions').insert(permissionObject).returning('*')
    return permission
  } catch (err) {
    throw pgErrorHandler(err);
  }
}

/**
 * Get permissions by name and clientKey
 *
 * @param {string} name - The name of the permission
 * @param {number} clientKey - The client key
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of permissions
 */
const getPermissionsByNameClientKey = async (name, clientKey) => {
  try {
    const permissions = await usherDb('permissions')
      .where({ name, clientkey: clientKey })
    return permissions
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

/**
 * Get permissions by optional filters
 *
 * @param {Object} filters - The filters to apply
 * @param {string} [filters.name] - The name of the permission
 * @param {string} [filters.clientId] - The client id
 * @param {string} [filters.clientKey] - The client key
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of permissions
 */
const getPermissions = async (filters = {}) => {
  try {
    const query = usherDb('permissions')
      .join('clients', 'permissions.clientkey', '=', 'clients.key')
      .select('permissions.*', 'clients.client_id')

    const { clientId, name, clientKey } = filters
    if (clientId) {
      query.where('clients.client_id', 'ilike', `%${clientId}%`)
    }
    if (name) {
      query.where('permissions.name', 'ilike', `%${name}%`)
    }
    if (clientKey) {
      query.where('permissions.clientkey', clientKey)
    }

    const permissions = await query
    return permissions
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

module.exports = {
  insertPermissionByClientId,
  updatePermissionByPermissionname,
  deletePermissionByPermissionname,
  getPermission,
  getPermissionsByRoleKey,
  insertPermission,
  getPermissionsByNameClientKey,
  getPermissions,
}
