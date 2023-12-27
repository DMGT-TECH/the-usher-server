const knex = require('knex');
const knexDbConfig = require('../knexfile');
const usherDb = knex(knexDbConfig);

module.exports = { usherDb }
