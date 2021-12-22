const env = require('../database-env')
const schemaName = env.PGSCHEMA

exports.up = function (knex) {
  return Promise.all([
    knex.schema
      .withSchema(schemaName)
      .raw(
        'ALTER TABLE usher.sessions ADD COLUMN idp_expirationtime TIMESTAMP'
      )
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('usher.sessions', table => {
      table.dropColumn('idp_expirationtime')
    })
  ])
}
