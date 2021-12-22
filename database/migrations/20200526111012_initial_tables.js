const env = require('../database-env')
const schemaName = env.PGSCHEMA

exports.up = function (knex) {
  return Promise.all([
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.tenants (
            key INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
            ,name VARCHAR(50) NOT NULL
            ,iss_claim VARCHAR(100) NOT NULL
            ,jwks_uri VARCHAR(100) NOT NULL)`
      )
      .raw(
        'ALTER TABLE usher.tenants ADD CONSTRAINT tenants_name_uq unique (name)'
      )
      .raw(
        'ALTER TABLE usher.tenants ADD CONSTRAINT tenants_name_issclaim_uq unique (name, iss_claim)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.clients(
            key INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
            ,client_id VARCHAR(50) NOT NULL
            ,name VARCHAR(50) NOT NULL
            ,description VARCHAR(100)
            ,secret VARCHAR(50))`
      )
      .raw(
        'ALTER TABLE usher.clients ADD CONSTRAINT clients_client_id_uq unique (client_id)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.personas (
            key INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
            ,tenantkey INT NOT NULL REFERENCES usher.tenants(key) ON DELETE CASCADE
            ,sub_claim VARCHAR(100) NOT NULL
            ,user_context VARCHAR(100) NOT NULL DEFAULT '')`
      )
      .raw(
        'ALTER TABLE usher.personas ADD CONSTRAINT personas_subclaim_userscope_tenantkey_uq unique(sub_claim, user_context, tenantkey)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.roles (
            key INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
            ,clientkey INT NOT NULL references usher.clients(key) ON DELETE CASCADE
            ,name VARCHAR(50) NOT NULL
            ,description VARCHAR(100))`
      )
      .raw(
        'ALTER TABLE usher.roles ADD CONSTRAINT roles_name_clientkey_uq unique (name, clientkey)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.permissions (
            key INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
            ,name VARCHAR(50) NOT NULL
            ,description VARCHAR(100))`
      )
      .raw(
        'ALTER TABLE usher.permissions ADD CONSTRAINT permissions_name_uq unique (name)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.groups(
            key INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
            ,name VARCHAR(50) NOT NULL
            ,description VARCHAR(100))`
      )
      .raw(
        'ALTER TABLE usher.groups ADD CONSTRAINT groups_name_uq unique (name)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.sessions (
            personakey INT NOT NULL references usher.personas(key) ON DELETE CASCADE
            ,event_id VARCHAR NOT NULL
            ,authorization_time TIMESTAMP NOT NULL
            ,scope VARCHAR NOT NULL
            ,idp_token VARCHAR NOT NULL)`
      )
      .raw(
        'ALTER TABLE usher.sessions ADD CONSTRAINT sessions_personakey_uq unique (personakey)'
      ),
    knex.schema
      .withSchema(schemaName)
      .raw(
        `CREATE TABLE usher.keys (
            key INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
            ,kid VARCHAR(100) NOT NULL
            ,private_key VARCHAR(4000) NOT NULL
            ,public_key VARCHAR(4000) NOT NULL)`
      )
      .raw('ALTER TABLE usher.keys ADD CONSTRAINT keys_kid_uq unique (kid)')
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema.withSchema(schemaName).dropTable('keys'),
    knex.schema.withSchema(schemaName).dropTable('sessions'),
    knex.schema.withSchema(schemaName).dropTable('groups'),
    knex.schema.withSchema(schemaName).dropTable('permissions'),
    knex.schema.withSchema(schemaName).dropTable('roles'),
    knex.schema.withSchema(schemaName).dropTable('personas'),
    knex.schema.withSchema(schemaName).dropTable('clients'),
    knex.schema.withSchema(schemaName).dropTable('tenants')
  ])
}
