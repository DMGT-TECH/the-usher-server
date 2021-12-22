const { PGPool } = require('./pg_pool')
const pool = new PGPool()

module.exports = {
  insertPermissionByClientId,
  updatePermissionByPermissionname,
  deletePermissionByPermissionname
}

async function insertPermissionByClientId (clientId, permissionname, permissiondescription) {
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

async function updatePermissionByPermissionname (clientId, permissionname, permissiondescription) {
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

async function deletePermissionByPermissionname (clientId, permissionname) {
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
