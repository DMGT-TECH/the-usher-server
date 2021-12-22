const env = require('../../server-env')
const packageVersion = require('../../package.json').version

async function getConfiguration (req, res) {
  const SERVER_URL = env.SERVER_URL

  const result = {
    token_endpoint: `${SERVER_URL}/self/token`,
    jwks_uri: `${SERVER_URL}/.well-known/jwks.json`,
    'the-usher-package-version': packageVersion
  }
  res.status(200).send(result)
}

module.exports = { getConfiguration }
