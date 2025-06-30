const env = require('../database-env')
const { usherDb } = require('../layer/knex')

async function dropCreateSchema () {
  // postgres doesn't support parameters for identifiers
  const sql1 = `drop schema if exists ${env.PGSCHEMA} cascade;`
  const sql2 = `create schema ${env.PGSCHEMA};`
  try {
    await usherDb.raw(sql1)
    await usherDb.raw(sql2)
    console.log('Drop/Create Schema Successful')
    return 'Drop/Create Schema Successful'
  } catch (error) {
    console.log(`Drop/Create Schema Failed: ${error.message}`)
    return `Drop/Create Schema Failed: ${error.message}`
  }
}

dropCreateSchema()
