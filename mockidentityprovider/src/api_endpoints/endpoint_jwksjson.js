const keystore = require('../utils/keystore')
const pem2jwk = require('pem-jwk').pem2jwk

async function getJwks (req, res) {
  const keyPairs = await keystore.selectAllKeys()
  const publicKeys = keyPairs.map(keyPair => {
    const item = pem2jwk(keyPair.public_key)
    item.kid = keyPair.kid
    console.log("item.kid == ", item.kid)
    return item
  })
  const result = { keys: publicKeys }

  res.append('Content-Type', 'application/json;charset=utf-8')
  res.status(200).send(result)
}

module.exports = { getJwks }
