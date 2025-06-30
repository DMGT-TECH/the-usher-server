require('dotenv').config()
const { usherDb } = require('../layer/knex')

module.exports = { deleteTestData, deleteAllData }

async function deleteTestData () {
  try {
    await usherDb.raw("DELETE FROM usher.clients WHERE client_id LIKE 'test-%'")
    await usherDb.raw("DELETE FROM usher.roles WHERE name LIKE 'test-%'")
    await usherDb.raw("DELETE FROM usher.permissions WHERE name LIKE 'test-%'")
    await usherDb.raw("DELETE FROM usher.tenants WHERE name LIKE 'test-%'")
    await usherDb.raw("DELETE FROM usher.personas WHERE sub_claim LIKE 'test-%'")
    return 'The test data clear up was successful'
  } catch (error) {
    throw new Error('Test data failed to delete ' + error.message)
  }
}

async function deleteAllData () {
  try {
    await usherDb.raw('DELETE FROM usher.clients')
    await usherDb.raw('DELETE FROM usher.roles')
    await usherDb.raw('DELETE FROM usher.permissions')
    await usherDb.raw('DELETE FROM usher.tenants')
    await usherDb.raw('DELETE FROM usher.personas')
    return 'The full data clear up was successful'
  } catch (error) {
    throw new Error('All data failed to delete ' + error.message)
  }
}
