const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

const insertPermissionByClientId = async (clientId, permissionName, permissionDescription) => {
  try {
    // Get the client key first
    const client = await usherDb('clients').where({ client_id: clientId }).first()
    if (!client) {
      throw new Error(`Client with id ${clientId} not found`)
    }

    const [permission] = await usherDb('permissions')
      .insert({
        clientkey: client.key,
        name: permissionName,
        description: permissionDescription
      })
      .returning('*')

    return permission
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

const updatePermissionByPermissionName = async (clientId, permissionName, permissionDescription) => {
  try {
    const updatedCount = await usherDb('permissions')
      .whereExists(function() {
        this.select('*')
          .from('clients')
          .where('clients.client_id', clientId)
      })
      .andWhere('name', permissionName)
      .update({ description: permissionDescription })

    return updatedCount
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

/**
 * Delete a permission by its name for a specific client
 * @param {string} clientId The client ID
 * @param {string} permissionName The unique name of the permission
 * @returns {Promise<number>} - A promise that resolves to the number of deleted rows
 */
const deletePermissionByPermissionName = async (clientId, permissionName) => {
  try {
    const deletedCount = await usherDb('permissions')
      .whereExists(function() {
        this.select('*')
          .from('clients')
          .where('clients.client_id', clientId)
      })
      .andWhere('name', permissionName)
      .del()

    return deletedCount
  } catch (err) {
    throw pgErrorHandler(err)
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
 * @param {number} [filters.clientKey] - The client key
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
  updatePermissionByPermissionName,
  deletePermissionByPermissionName,
  getPermission,
  getPermissionsByRoleKey,
  insertPermission,
  getPermissionsByNameClientKey,
  getPermissions,
}
