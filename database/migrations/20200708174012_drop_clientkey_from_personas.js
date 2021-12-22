const env = require('../database-env')
const schemaName = env.PGSCHEMA

exports.up = function (knex) {
  return Promise.all([
    knex.schema
      .withSchema(schemaName)
      .raw(
        'ALTER TABLE usher.personas DROP COLUMN clientkey'
      )
      .raw(
        'ALTER TABLE usher.permissions ALTER COLUMN clientkey SET NOT NULL'
      )
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema
      .withSchema(schemaName)
      .raw(
        'ALTER TABLE usher.personas ADD COLUMN clientkey INTEGER'
      )
      .raw(
        'ALTER TABLE usher.permissions ALTER COLUMN clientkey DROP NOT NULL'
      )
  ])
}
