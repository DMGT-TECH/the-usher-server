require('dotenv').config()

const getServerUrl = () => {
  let serverUrl = 'http://localhost:3001'

  if (process.env.TEST_THEUSHER_SERVER) {
    serverUrl = process.env.TEST_THEUSHER_SERVER
  }

  return serverUrl
}

module.exports = {
  getServerUrl
}
