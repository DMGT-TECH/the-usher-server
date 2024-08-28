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
    min: 1,
    max: 100,
  },
}
