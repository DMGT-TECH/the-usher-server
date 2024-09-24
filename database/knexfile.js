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
    max: +process.env.KNEX_POOL_MAX || 5,
    
    // tarn config (https://www.npmjs.com/package/tarn)
    propagateCreateError: false,
    createRetryIntervalMillis: 500,
    createTimeoutMillis: 5000,
    acquireTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
  },
}
