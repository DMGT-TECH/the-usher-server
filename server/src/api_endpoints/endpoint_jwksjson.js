const keystore = require('database/layer/db-keys')
const { pem2jwk } = require('pem-jwk')
const createError = require('http-errors')
const NodeCache = require('node-cache')

const myCache = new NodeCache({ stdTTL: 60, checkperiod: 30 })
const getJwks = async (req, res) => {
  try {
    const cacheKeyName = 'usher-jwks'
    let response = myCache.get(cacheKeyName)

    if (response) {
      res.set('x-cache', 'Hit from Usher')
    } else {
      const keyPairs = await keystore.selectAllKeys()
      const publicKeys = keyPairs?.map(keyPair => {
        const item = pem2jwk(keyPair.public_key)
        item.kid = keyPair.kid
        return item
      })
      response = { keys: publicKeys }
      myCache.set(cacheKeyName, response)
    }

    res.status(200).send(response)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = { getJwks }
