const env = require('./database-env')

module.exports = {
  client: 'pg',
  connection: env.PGURI,
  migrations: {
    tableName: 'knex_migrations',
    schemaName: env.PGSCHEMA
  }
}
