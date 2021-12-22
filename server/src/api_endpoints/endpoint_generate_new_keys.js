const { generateKeyPairSync } = require('crypto')
var keystore = require('database/layer/db-keys')

function generateAndInsertNewKeys () {
  // TODO: Security Review
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })

  keystore.insertKey(new Date(), publicKey, privateKey)
}

function generateNewKeys (req, res) {
  generateAndInsertNewKeys()
  res.status(200).send('OK')
}

module.exports = {
  generateNewKeys,
  generateAndInsertNewKeys
}
