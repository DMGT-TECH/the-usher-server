const env = require('../database-env')
const schemaName = env.PGSCHEMA

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(schemaName)
    .table('permissions', t => t.foreign('clientkey').references('key').inTable('clients')
      .onDelete('CASCADE')
      .onUpdate('CASCADE'))
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.withSchema(schemaName)
    .table('permissions', t => t.dropForeign('clientkey'))
};
