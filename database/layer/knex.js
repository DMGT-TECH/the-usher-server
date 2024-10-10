const knex = require('knex')
const knexDbConfig = require('../knexfile')

/**
 * Usher DB connection instance.
 * @name usherDb
 * @type {import('knex')}
 * @desc This instance provides a connection to the Usher database using Knex.js
 * @example // To import usherDb instance
 * const { usherDb } = require('./knex')
 * @example // To perform a database query
 * const persona = await usherDb('personas').where('key', personaKey).first()
 */
let usherDb
try {
  usherDb = knex(knexDbConfig)
  if (usherDb?.client?.pool) {
    const pool = usherDb.client.pool
    /* 
      Set idleTimeoutMillis to 0 to ensure connections are released during the next pool.check() interval.
      The check interval can be configured using reapIntervalMillis.
      Default idleTimeoutMillis is 30000 ms.
    */
    pool.idleTimeoutMillis = 0
  }
} catch (err) {
  console.error('Failed to create knex instance: ', JSON.stringify(err))
}

module.exports = { usherDb }
