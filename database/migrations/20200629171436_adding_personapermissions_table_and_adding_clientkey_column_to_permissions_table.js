const env = require('../database-env')
const schemaName = env.PGSCHEMA

exports.up = function (knex) {
  return Promise.all([
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.personapermissions (
            personakey INT NOT NULL references usher.personas(key) ON DELETE CASCADE
            ,permissionkey INT NOT NULL references usher.permissions(key) ON DELETE CASCADE)`
      )
      .raw(
        'ALTER TABLE usher.personapermissions ADD CONSTRAINT personapermissions_personakey_permissionkey_uq unique(personakey, permissionkey)'
      )
      .raw(
        'ALTER TABLE usher.permissions ADD COLUMN clientkey INTEGER'
      )
      .raw(
        'ALTER TABLE usher.personas ADD COLUMN clientkey INTEGER'
      )
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema.withSchema(schemaName).dropTable('personapermissions'),
    knex.schema.table('usher.permissions', table => {
      table.dropColumn('clientkey')
    }),
    knex.schema.table('usher.personas', table => {
      table.dropColumn('clientkey')
    })
  ])
}
