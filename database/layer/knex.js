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
    // Set idle timeout to 0 to release connections immediately. This can't be configured through Knex.
    pool.idleTimeoutMillis = 0

    // Check the pool for idle connections on 'release' event
    pool.on('release', () => {
      process.nextTick(() => {
        pool.check() // Ensures the pool checks for idle connections immediately
      })
    })
  }
} catch (err) {
  console.error('Failed to create knex instance: ', JSON.stringify(err))
}

module.exports = { usherDb }
