const { Pool } = require('pg')
const env = require('../database-env')

const pool = new Pool({
  connectionString: env.PGURI
})

/**
 * Get an instance of the Postgres Pool object
 * @returns The instance of the Postgres connection Pool
 */
function PGPool () {
  return pool
}

module.exports = { PGPool }
