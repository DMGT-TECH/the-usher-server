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
    min: +process.env.KNEX_POOL_MIN || 0,
    max: +process.env.KNEX_POOL_MAX || 100,

    // tarn config (https://www.npmjs.com/package/tarn)
    propagateCreateError: process.env.KNEX_POOL_PROPAGATE_CREATE_ERROR === 'true' || false,
    createRetryIntervalMillis: +process.env.KNEX_POOL_CREATE_RETRY_INTERVAL_MILLIS || 500,
    createTimeoutMillis: +process.env.KNEX_POOL_CREATE_TIMEOUT_MILLIS || 5000,
    acquireTimeoutMillis: +process.env.KNEX_POOL_ACQUIRE_TIMEOUT_MILLIS || 5000,
    reapIntervalMillis: +process.env.KNEX_POOL_REAP_INTERVAL_MILLIS || 1000,
  },
}
