const { PGPool } = require('./pg_pool')
const pool = new PGPool()

module.exports = {
  insertClient,
  updateClientByClientId,
  deleteClientByClientId
}

async function insertClient (clientId, clientname, clientdescription, secret) {
  const sql = 'INSERT INTO usher.clients (client_id, name, description, secret) VALUES ($1, $2, $3, $4)'
  try {
    await pool.query(sql, [clientId, clientname, clientdescription, secret])
    return 'Insert successful'
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "clients_client_id_uq"') {
      const errClientAlreadyExists = `Client already exists matching client_id ${clientId}`
      return `Insert failed: ${errClientAlreadyExists}`
    }
    return `Insert failed: ${error.message}`
  }
}

async function updateClientByClientId (clientId, clientname, clientdescription, secret) {
  const sql = 'UPDATE usher.clients SET name = $1, description = $2, secret = $3 WHERE client_id = $4'
  try {
    const results = await pool.query(sql, [clientname, clientdescription, secret, clientId])
    if (results.rowCount === 1) {
      return 'Update successful'
    } else {
      return `Update failed: Client does not exist matching client_id ${clientId}`
    }
  } catch (error) {
    return `Update failed: ${error.message}`
  }
}

async function deleteClientByClientId (clientId) {
  const sql = 'DELETE FROM usher.clients WHERE client_id = $1'
  try {
    const results = await pool.query(sql, [clientId])
    if (results.rowCount === 1) {
      return 'Delete successful'
    } else {
      return `Delete failed: Client does not exist matching client_id ${clientId}`
    }
  } catch (error) {
    return `Delete failed: ${error.message}`
  }
}
