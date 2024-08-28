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
    min: process.env.KNEX_POOL_MIN || 1,
    max: process.env.KNEX_POOL_MAX || 100,
  },
}
