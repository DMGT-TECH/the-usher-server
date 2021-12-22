const env = require('../database-env')
const schemaName = env.PGSCHEMA

exports.up = function (knex) {
  return Promise.all([
    knex.schema
      .withSchema(schemaName)
      .raw(
        'ALTER TABLE usher.permissions DROP CONSTRAINT permissions_name_uq'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        'ALTER TABLE usher.roles ADD CONSTRAINT permissions_name_clientkey_uq unique (name, clientkey)'
      ),
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema
      .withSchema(schemaName)
      .raw(
        'ALTER TABLE usher.permissions ADD CONSTRAINT permissions_name_uq unique (name)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        'ALTER TABLE usher.roles DROP CONSTRAINT permissions_name_clientkey_uq'
      ),
  ])
}
