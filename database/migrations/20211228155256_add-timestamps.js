const env = require('../database-env')
const schemaName = env.PGSCHEMA

exports.up = function(knex) {
  return knex.schema.withSchema(schemaName)
    .table('permissions', t => t.timestamps(true, true))
    .table('rolepermissions', t => t.timestamps(true, true))
    .table('clients', t => t.timestamps(true, true))
    .table('personaroles', t => t.timestamps(true, true))
    .table('personapermissions', t => t.timestamps(true, true))
    .table('personas', t => t.timestamps(true, true))
    .table('tenantclients', t => t.timestamps(true, true))
    .table('tenants', t => t.timestamps(true, true))
    .table('keys', t => t.timestamps(true, true))
    .table('roles', t => {
      t.timestamps(true, true)
      // remove duplicate unique index
      t.dropUnique(['name', 'clientkey'], 'permissions_name_clientkey_uq')
    })
}

exports.down = function(knex) {
  return knex.schema.withSchema(schemaName)
    .table('permissions', t => t.dropTimestamps())
    .table('rolepermissions', t => t.dropTimestamps())
    .table('clients', t => t.dropTimestamps())
    .table('personaroles', t => t.dropTimestamps())
    .table('personapermissions', t => t.dropTimestamps())
    .table('personas', t => t.dropTimestamps())
    .table('tenantclients', t => t.dropTimestamps())
    .table('tenants', t => t.dropTimestamps())
    .table('keys', t => t.dropTimestamps())
    .table('roles', t => t.dropTimestamps()) // no-op for dropping duplicate index
}
