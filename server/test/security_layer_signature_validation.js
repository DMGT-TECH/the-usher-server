const { describe, it } = require('mocha')
const { getTestUser1IdPToken, getAdmin1IdPToken } = require('./lib/tokens')
const assert = require('assert')
const jwtDecoder = require('jsonwebtoken')

describe('Verify Token Middleware', () => {
  let userAccessToken = ''

  function verifyDecodedToken ({ header, payload, signature }) {
    assert(header, 'The decoded token should have contained a header')
    assert(payload, 'The decoded token should have contained a payload')
    assert(signature, 'The decoded token should have contained a token signature')

    const {
      alg,
      typ,
      kid
    } = header
    assert(typ === 'JWT', 'The decoded token should have been type JWT.')
    assert(alg && alg !== 'none', 'The decoded token should have used a secure crytographic algorithm.')
    assert(kid, 'The decoded token should have contained a key ID.')

    const {
      iss,
      sub,
      aud,
      iat,
      exp
    } = payload
    assert(iss, 'The payload should have contained an issuer claim')
    assert(sub, 'The payload should have contained a subject claim')
    assert(aud && aud.length, 'The payload should have contained an audience claim')
    assert(iat, 'The payload should have contained an "issued at" claim')
    assert(exp, 'The payload should have contained an "expiration time" claim')
  }

  it('should get an IdP token for self', async function () {
    userAccessToken = await getTestUser1IdPToken()
    assert(userAccessToken, 'An IdP token should have been returned by the configured identity provider.')
  })

  it('should decode and verify a valid IdP token for self', async function () {
    const decodedUserAccessToken = jwtDecoder.decode(userAccessToken, { complete: true })
    assert(decodedUserAccessToken, 'The IdP token should have successfully decoded, if valid.')
    verifyDecodedToken(decodedUserAccessToken)
  })

  let adminAccessToken = ''

  it('should get an IdP token for admin', async function () {
    adminAccessToken = await getAdmin1IdPToken()
    assert(adminAccessToken, 'An IdP token should have been returned by the configured identity provider.')
  })

  it('should decode and verify a valid IdP token for admin', async function () {
    const decodedAdminAccessToken = jwtDecoder.decode(adminAccessToken, { complete: true })
    assert(decodedAdminAccessToken, 'The IdP token should have successfully decoded, if valid.')
    verifyDecodedToken(decodedAdminAccessToken)
  })
})
