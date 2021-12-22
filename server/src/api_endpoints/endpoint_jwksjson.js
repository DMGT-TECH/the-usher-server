const keystore = require('database/layer/db-keys')
const pem2jwk = require('pem-jwk').pem2jwk

async function getJwks (req, res) {
  const keyPairs = await keystore.selectAllKeys()
  const publicKeys = keyPairs.map(keyPair => {
    const item = pem2jwk(keyPair.public_key)
    item.kid = keyPair.kid
    return item
  })
  const result = { keys: publicKeys }
  res.status(200).send(result)
}

module.exports = { getJwks }
