const env = require('../database-env')
const schemaName = env.PGSCHEMA

exports.up = function (knex) {
  return Promise.all([
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.grouproles (
            groupkey INT NOT NULL references usher.groups(key) ON DELETE CASCADE
            ,rolekey INT NOT NULL references usher.roles(key) ON DELETE CASCADE)`
      )
      .raw(
        'ALTER TABLE usher.grouproles ADD CONSTRAINT grouproles_groupkey_rolekey_uq unique (groupkey, rolekey)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.personaroles (
            personakey INT NOT NULL references usher.personas(key) ON DELETE CASCADE
            ,rolekey INT NOT NULL references usher.roles(key) ON DELETE CASCADE)`
      )
      .raw(
        'ALTER TABLE usher.personaroles ADD CONSTRAINT personaroles_personakey_rolekey_uq unique (personakey, rolekey)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.rolepermissions (
            rolekey INT NOT NULL references usher.roles(key) ON DELETE CASCADE
            ,permissionkey INT NOT NULL references usher.permissions(key) ON DELETE CASCADE)`
      )
      .raw(
        'ALTER TABLE usher.rolepermissions ADD CONSTRAINT rolepermissions_rolekey_permissionkey_uq unique(rolekey, permissionkey)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.tenantgroups (
            tenantkey INT NOT NULL REFERENCES usher.tenants(key) ON DELETE CASCADE
            ,groupkey INT NOT NULL references usher.groups(key) ON DELETE CASCADE)`
      )
      .raw(
        'ALTER TABLE usher.tenantgroups ADD CONSTRAINT tenantgroups_tenantkey_groupkey_uq unique(tenantkey, groupkey)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.tenantclients (
            tenantkey INT NOT NULL REFERENCES usher.tenants(key) ON DELETE CASCADE
            ,clientkey INT NOT NULL references usher.clients(key) ON DELETE CASCADE)`
      )
      .raw(
        'ALTER TABLE usher.tenantclients ADD CONSTRAINT tenantclients_tenantkey_clientkey_uq unique(tenantkey, clientkey)'
      ),
    knex.schema.withSchema(schemaName).raw(
      `CREATE TABLE usher.performancelogs (
            timestamp timestamp without time zone
            ,level text
            ,message text
            ,meta json)`
    )
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema.withSchema(schemaName).dropTable('performancelogs'),
    knex.schema.withSchema(schemaName).dropTable('tenantclients'),
    knex.schema.withSchema(schemaName).dropTable('tenantgroups'),
    knex.schema.withSchema(schemaName).dropTable('rolepermissions'),
    knex.schema.withSchema(schemaName).dropTable('personaroles'),
    knex.schema.withSchema(schemaName).dropTable('grouproles')
  ])
}
