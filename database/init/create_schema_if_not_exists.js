const env = require('../database-env')
const { usherDb } = require('../layer/knex')

async function createSchemaIfNotExists () {
  try {
    const schemaName = env.PGSCHEMA
    await usherDb.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)
    process.exit(0)
  } catch (error) {
    console.error(`ERROR: Failed to create schema: ${error.message}`)
    process.exit(1)
  }
}

createSchemaIfNotExists()
