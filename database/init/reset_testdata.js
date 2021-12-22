const dbTestData = require('./load_test_data')

resetTestdata()

async function resetTestdata () {
  try {
    await dbTestData.deleteTestData()
    await dbTestData.loadTestData()
    process.exit(0)
  } catch (error) {
    throw new Error('Error resetting test data : ' + error.message)
  }
}
