const moment = require('moment')
const jwt = require('jsonwebtoken')
const keystore = require('./keystore.js')

/**
 * Calculate the unix dates for a token's claims (iat, exp) based on the
 * server config for TOKEN_LIFETIME_SECONDS.
 *
 * @param {number} secondsUntilExpiry The duration (in seconds) the token should be valid for
 * @returns {number} expiry time as epoch milliseconds
 */
function calculateUnixTimeAfterSeconds (secondsUntilExpiry) {
  const utcNow = moment.utc()
  const expiryTime = utcNow.add(secondsUntilExpiry, 'seconds')
  const exp = moment(expiryTime).unix()
  return exp
}

/**
 * Creates a signed access token.
 * @param {string} sub The sub claim for the User
 * @param {string} azp The authorized party, client id (name) requesting the token
 * @param {string} roles Space separated list of Roles
 * @param {string} scope Space separated list of Scopes
 * @param {number} secondsUntilExpiry The duration (in seconds) the token should be valid for
 */
async function createSignedAccessToken (sub, azp, roles, scope, secondsUntilExpiry) {
  const latestKeyPair = await keystore.selectLatestKey()

  const signedAccessToken = jwt.sign(
    {
      iss: process.env.SERVER_URL,
      sub: sub,
      azp: azp,
      roles: roles,
      scope: scope,
      exp: calculateUnixTimeAfterSeconds(secondsUntilExpiry)
    },
    latestKeyPair.private_key,
    {
      algorithm: 'RS256',
      header: { kid: latestKeyPair.kid }
    }
  )

  return signedAccessToken
}

module.exports = {
  createSignedAccessToken,
  calculateUnixTimeAfterSeconds
}
