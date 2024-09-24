const keystore = require('database/layer/db-keys')
const { pem2jwk } = require('pem-jwk')
const createError = require('http-errors')

const getJwks = async (req, res, next) => {
  try {
    const keyPairs = await keystore.selectAllKeys()
    const publicKeys = keyPairs?.map(keyPair => {
      const item = pem2jwk(keyPair.public_key)
      item.kid = keyPair.kid
      return item
    })
    res.status(200).send({ keys: publicKeys })
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = { getJwks }
