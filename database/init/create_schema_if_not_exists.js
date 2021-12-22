const env = require('../database-env')
const { PGPool } = require('../layer/pg_pool')
const pool = new PGPool()

async function createSchemaIfNotExists () {
  try {
    const schemaName = env.PGSCHEMA
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)
    process.exit(0)
  } catch (error) {
    console.error(`ERROR: Failed to create schema: ${error.message}`)
    process.exit(1)
  }
}

createSchemaIfNotExists()
