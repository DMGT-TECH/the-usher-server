const dbSampleData = require('../init/load_sample_data')

exports.seed = (knex) => {
  // Load Original Sample Data
  // TODO This needs to be refactored to be idempotent
  return dbSampleData.loadSampleData()
}
