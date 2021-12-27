const jwt = require('jsonwebtoken')
const tokenUtils = require('../utils/token-utils')
const keystore = require('../utils/keystore')

const mockServerData = [
  {
    "username": "test-user1@dmgtoocto.com",
    "password": "password12345!",
    "scope": "openid email",
    "sub": "mockauth0|5e472b2d8a409e0e62026856",
    "client_id": "SXvK7prPkRPDyElECLO1rzLBKQ3bhMur",
    "aud": "https://us-central1-dmgt-oocto.cloudfunctions.net/the-usher"
  },
  {
    "username": "test-user2@dmgtoocto.com",
    "password": "password12345!",
    "scope": "openid email",
    "sub": "mockauth0|5e472b2d8a409e0e62026856-2",
    "client_id": "SXvK7prPkRPDyElECLO1rzLBKQ3bhMur",
    "aud": "https://us-central1-dmgt-oocto.cloudfunctions.net/the-usher"
  },
  {
    "username": "test-admin1@dmgtoocto.com",
    "password": "password12345!",
    "scope": "openid email",
    "sub": "mockauth0|5e5feabeb087080ddea78663",
    "client_id": "SXvK7prPkRPDyElECLO1rzLBKQ3bhMur",
    "aud": "https://us-central1-dmgt-oocto.cloudfunctions.net/the-usher"
  },
  {
    "username": "test-admin2@dmgtoocto.com",
    "password": "password12345!",
    "scope": "openid email",
    "sub": "mockauth0|5e62a48b2f42030d3688947e",
    "client_id": "SXvK7prPkRPDyElECLO1rzLBKQ3bhMur",
    "aud": "https://us-central1-dmgt-oocto.cloudfunctions.net/the-usher"
  },
]

async function createSignedToken (claims) {
  const latestKeyPair = await keystore.selectLatestKey()
  claims['kid'] = latestKeyPair.kid
  const signedToken = jwt.sign(
    claims,
    latestKeyPair.private_key,
    {
      algorithm: 'RS256',
      header: { kid: latestKeyPair.kid }
    }
  )

  return signedToken
}


async function issueOauthToken (req, res, next) {
  // calculate the duration of the new access token to be issued
  const accessTokenDurationSeconds = 3600
  const id = mockServerData.filter(x => x.username == req.body.username && x.password == req.body.password)[0]

  const accessTokenClaims = {
    "iss": `http://${req.headers.host}/`,
    "sub": id.sub,
    "aud": [
      id.aud,
    ],
    "iat": tokenUtils.calculateUnixTimeAfterSeconds(0),
    "exp": tokenUtils.calculateUnixTimeAfterSeconds(accessTokenDurationSeconds),
    "azp": id.client_id,
    "scope": id.scope,
    "gty": 'password'
  }

  const idTokenClaims = {
    "email": id.username,
    "email_verified": false,
    "iss": `http://${req.headers.host}/`,
    "sub": id.sub,
    "aud": id.aud,
    "iat": tokenUtils.calculateUnixTimeAfterSeconds(0),
    "exp": tokenUtils.calculateUnixTimeAfterSeconds(accessTokenDurationSeconds),
  }

  const signedAccessToken = await createSignedToken(accessTokenClaims)
  const signedIdToken = await createSignedToken(idTokenClaims)

  res.append('Cache-Control', 'no-store')
  res.append('Pragma', 'no-cache')

  res.status(200).send({
    token_type: 'Bearer',
    access_token: signedAccessToken,
    id_token: signedIdToken,
    expires_in: accessTokenDurationSeconds
  })
}

module.exports = {
  issueOauthToken
}
