const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

/**
 * Inserts a new group-role relationship into the database.
 * @param {string} groupName
 * @param {string} clientId
 * @param {string} roleName
 * @returns {Promise<Object>} A promise that resolves to the inserted group-role relationship object
 */
const insertGroupRole = async (groupName, clientId, roleName) => {
  try {
    const group = await usherDb('groups').where({ name: groupName }).first('key')
    if (!group) {
      throw new Error(`Group with name ${groupName} not found`)
    }

    const role = await usherDb('roles')
      .join('clients as c', 'roles.clientkey', 'c.key')
      .where({ 'c.client_id': clientId, 'roles.name': roleName }).first('roles.key')
    if (!role) {
      throw new Error(`Role with name ${roleName} for client_id ${clientId} not found`)
    }

    const [groupRole] = await usherDb('grouproles')
      .insert({
        groupkey: group.key,
        rolekey: role.key
      })
      .returning('*')

    return groupRole
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

const deleteGroupRole = async (groupName, clientId, roleName) => {
  try {
    const deletedCount = await usherDb('grouproles')
      .whereExists(function() {
        this.select('key').from('groups')
          .whereRaw('groups.name = ?', [groupName])
          .andWhereRaw('groups.key = grouproles.groupkey')
      })
      .whereExists(function() {
        this.select('c.key').from('clients as c')
          .join('roles as r', 'r.clientkey', 'c.key')
          .whereRaw('c.client_id = ?', [clientId])
          .andWhereRaw('r.name = ?', [roleName])
          .andWhereRaw('r.key = grouproles.rolekey')
      })
      .del()

    return deletedCount
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

module.exports = {
  insertGroupRole,
  deleteGroupRole
}
