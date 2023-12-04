const env = require('./database-env')

module.exports = {
  client: 'pg',
  connection: env.PGURI,
  searchPath: [env.PGSCHEMA],
  migrations: {
    tableName: 'knex_migrations',
    schemaName: env.PGSCHEMA
  }
}
