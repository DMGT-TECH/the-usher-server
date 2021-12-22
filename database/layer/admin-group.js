const { PGPool } = require('./pg_pool')
const pool = new PGPool()

module.exports = {
  insertGroup,
  updateGroupByGroupname,
  deleteGroupByGroupname
}

async function insertGroup (groupname, groupdescription) {
  const sql = 'INSERT INTO usher.groups (name, description) VALUES ($1, $2)'
  const sqlParams = [groupname, groupdescription]
  try {
    await pool.query(sql, sqlParams)
    return 'Insert successful'
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "groups_name_uq"') {
      const errGroupAlreadyExists = `Group already exists matching groupname ${groupname}`
      return `Insert failed: ${errGroupAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

async function updateGroupByGroupname (groupname, groupdescription) {
  const sql = 'UPDATE usher.groups SET description = $1 WHERE name = $2'
  const sqlParams = [groupdescription, groupname]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Update successful'
    } else {
      return `Update failed: Group does not exist matching groupname ${groupname}`
    }
  } catch (error) {
    return `Update failed: ${error.message}`
  }
}

async function deleteGroupByGroupname (groupname) {
  const sql = 'DELETE FROM usher.groups WHERE name = $1'
  const sqlParams = [groupname]
  try {
    const results = await pool.query(sql, sqlParams)
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Group does not exist matching groupname ${groupname}`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}
