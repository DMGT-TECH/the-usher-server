const { generateKeyPairSync } = require('crypto')
var keystore = require('../utils/keystore.js')

async function generateAndInsertNewKeys () {
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

  await keystore.insertKey(new Date(), publicKey, privateKey)
}

async function generateNewKeys (req, res) {
  await generateAndInsertNewKeys()
  res.status(200).send('OK')
}

module.exports = {
  generateNewKeys,
  generateAndInsertNewKeys
}
