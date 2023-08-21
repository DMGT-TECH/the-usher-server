require('dotenv').config()

async function getConfiguration (req, res) {
  const SERVER_URL = `http://${req.headers.host}`

  const result = {
    token_endpoint: `${SERVER_URL}/oauth/token`,
    jwks_uri: `${SERVER_URL}/.well-known/jwks.json`
  }
  // oas-tools Bug preventing using res.json
  // https://github.com/oas-tools/oas-tools/issues/71
  res.append('Content-Type', 'application/json;charset=utf-8')
  res.status(200).send(result)
}

module.exports = { getConfiguration }
