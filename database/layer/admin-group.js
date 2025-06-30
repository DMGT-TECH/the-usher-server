const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

const insertGroup = async (name, description) => {
  try {
    const [group] = await usherDb('groups')
      .insert({
        name,
        description
      })
      .returning('*')
    return group
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

const updateGroupByGroupname = async (name, description) => {
  try {
    const updatedCount = await usherDb('groups')
      .where('name', name)
      .update({ description })

    return updatedCount
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

/**
 * Delete a group by its name
 * @param {string} name The group name
 * @returns {Promise<number>} A promise that resolves to the number of deleted rows
 */
const deleteGroupByGroupname = async (name) => {
  try {
    const deletedCount = await usherDb('groups')
      .where('name', name)
      .del()

    return deletedCount
  } catch (error) {
    throw pgErrorHandler(error)
  }
}

module.exports = {
  insertGroup,
  updateGroupByGroupname,
  deleteGroupByGroupname
}
