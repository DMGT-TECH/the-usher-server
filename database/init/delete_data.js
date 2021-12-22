require('dotenv').config()
const { PGPool } = require('../layer/pg_pool')
const pool = new PGPool()

module.exports = { deleteTestData, deleteAllData }

async function deleteTestData () {
  try {
    await pool.query("DELETE FROM usher.clients WHERE client_id LIKE 'test-%'")
    await pool.query("DELETE FROM usher.roles WHERE name LIKE 'test-%'")
    await pool.query("DELETE FROM usher.permissions WHERE name LIKE 'test-%'")
    await pool.query("DELETE FROM usher.tenants WHERE name LIKE 'test-%'")
    await pool.query("DELETE FROM usher.personas WHERE sub_claim LIKE 'test-%'")
    return 'The test data clear up was successful'
  } catch (error) {
    throw new Error('Test data failed to delete ' + error.message)
  }
}

async function deleteAllData () {
  try {
    await pool.query('DELETE FROM usher.clients')
    await pool.query('DELETE FROM usher.roles')
    await pool.query('DELETE FROM usher.permissions')
    await pool.query('DELETE FROM usher.tenants')
    await pool.query('DELETE FROM usher.personas')
    return 'The full data clear up was successful'
  } catch (error) {
    throw new Error('All data failed to delete ' + error.message)
  }
}
