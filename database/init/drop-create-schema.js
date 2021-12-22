const env = require('../database-env')
const { PGPool } = require('../layer/pg_pool')
const pool = new PGPool()

async function dropCreateSchema () {
  // postgres doesn't support parameters for identifiers
  const sql1 = `drop schema if exists ${env.PGSCHEMA} cascade;`
  const sql2 = `create schema ${env.PGSCHEMA};`
  try {
    await pool.query(sql1)
    await pool.query(sql2)
    console.log('Drop/Create Schema Successful')
    return 'Drop/Create Schema Successful'
  } catch (error) {
    console.log(`Drop/Create Schema Failed: ${error.message}`)
    return `Drop/Create Schema Failed: ${error.message}`
  }
}

dropCreateSchema()
