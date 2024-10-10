const env = require('./database-env')

module.exports = {
  client: 'pg',
  connection: env.PGURI,
  searchPath: [env.PGSCHEMA, 'public'],
  migrations: {
    tableName: 'knex_migrations',
    schemaName: env.PGSCHEMA,
  },
  pool: {
    min: +process.env.KNEX_POOL_MIN || 0, // Minimum number of connections in the pool
    max: +process.env.KNEX_POOL_MAX || 100, // Maximum number of connections in the pool

    /*
      Tarn.js configuration (see https://www.npmjs.com/package/tarn for more details)
      Default tarn.js settings:
        propagateCreateError: true // Whether to propagate errors encountered during creation
        createRetryIntervalMillis: 200 // Delay between retries when trying to create a new connection
        createTimeoutMillis: 30000 // Time to wait before timing out when creating a new connection
        acquireTimeoutMillis: 30000 // Time to wait before timing out when acquiring a connection from the pool
        reapIntervalMillis: 1000 // Frequency of checking for idle resources to be destroyed
    */
    propagateCreateError: process.env.KNEX_POOL_PROPAGATE_CREATE_ERROR === 'true' || false,
    createRetryIntervalMillis: +process.env.KNEX_POOL_CREATE_RETRY_INTERVAL_MILLIS || 200,
    createTimeoutMillis: +process.env.KNEX_POOL_CREATE_TIMEOUT_MILLIS || 10000,
    acquireTimeoutMillis: +process.env.KNEX_POOL_ACQUIRE_TIMEOUT_MILLIS || 10000,
    reapIntervalMillis: +process.env.KNEX_POOL_REAP_INTERVAL_MILLIS || 500,
  },
}
