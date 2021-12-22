require('dotenv').config()

async function getConfiguration (req, res) {
  const SERVER_URL = `http://${req.headers.host}`

  const result = {
    token_endpoint: `${SERVER_URL}/oauth/token`,
    jwks_uri: `${SERVER_URL}/.well-known/jwks.json`
  }
  res.status(200).send(result)
}

module.exports = { getConfiguration }
