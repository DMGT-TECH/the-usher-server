const knex = require('knex');
const knexDbConfig = require('../knexfile');

/**
 * Usher DB connection instance.
 * @name usherDb
 * @type {import('knex')}
 * @desc This instance provides a connection to the Usher database using Knex.js
 * @example // To import usherDb instance
 * const { usherDb } = require('./knex');
 * @example // To perform a database query
 * const persona = await usherDb('personas').where('key', personaKey).first();
 */
const usherDb = knex(knexDbConfig);

module.exports = { usherDb }
