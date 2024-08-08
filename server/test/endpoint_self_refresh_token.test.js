const { describe, it, before, after } = require('mocha')
const assert = require('node:assert')
const crypto = require('node:crypto')
const fetch = require('node-fetch')
const jwtDecoder = require('jsonwebtoken')
const postSessions = require('database/layer/admin-session')

const { getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')

describe('Issue Self Refresh Token', () => {
  let idpToken = ''
  const issClaim = 'http://idp.dmgt.com.mock.localhost:3002/'
  const url = `${getServerUrl()}/self/refresh_token`

  before(async function () {
    // GET IDENTITY-PROVIDER TOKEN
    idpToken = await getTestUser1IdPToken()
  })

  describe('Error responses', () => {
    const expiredEventId = crypto.randomUUID()
    const subClaim = 'mockauth0|5e472b2d8a409e0e62026856'

    before(async function () {
      // first delete session if exists
      try {
        await postSessions.deleteSessionBySubIss(subClaim, '', issClaim)
      } catch (err) {
        // noop, this is ok if session for persona does not exist
      }
      // insert expired session
      await postSessions.insertSessionBySubIss(subClaim, '', issClaim, expiredEventId, '2020-01-01 00:00:00.000', '2020-01-01 00:30:00.000', 'dummy_permission:dummyA', 'eydsagdsadahdhwwgywqrwqrqrwqwqy')
    })

    after(async function () {
      try {
        await postSessions.deleteSessionBySubIss(subClaim, '', issClaim)
      } catch (err) {
        // noop, this is ok if session for persona does not exist
      }
    })

    it('should return a bad request response when invalid grant_type', async function () {
      // arrange
      const grantType = ''
      const refreshToken = 'dummy_refresh_token'
      const clientId = 'dummy_client_id'

      // act
      const response = await fetch(`${url}?grant_type=${grantType}&refresh_token=${refreshToken}&client_id=${clientId}`, { method: 'POST' })
      const responseBody = await response.text()
      const responseJSON = JSON.parse(responseBody)
      const statusCode = response.status

      // assert
      assert(statusCode === 400, `Expected response status code to be 400 but was ${statusCode}`)
      assert(responseJSON.message === 'Wrong parameter grant_type in query. ', `Actual response body: ${responseJSON}`)
    })

    it('should return a bad request response when invalid refresh_token', async function () {
      // arrange
      const grantType = 'refresh_token'
      const refreshToken = ''
      const clientId = 'dummy_client_id'

      // act
      const response = await fetch(`${url}?grant_type=${grantType}&refresh_token=${refreshToken}&client_id=${clientId}`, { method: 'POST' })
      const responseBody = await response.text()
      const responseJSON = JSON.parse(responseBody)
      const statusCode = response.status

      // assert
      assert(statusCode === 400, `Expected response status code to be 400 but was ${statusCode}`)
      assert(responseJSON.message === 'Wrong parameter refresh_token in query. ', `Actual response body: ${responseBody}`)
    })

    it('should return a bad request response when invalid client_id', async function () {
      // arrange
      const grantType = 'refresh_token'
      const refreshToken = 'dummy_refresh_token'
      const clientId = ''

      // act
      const response = await fetch(`${url}?grant_type=${grantType}&refresh_token=${refreshToken}&client_id=${clientId}`, { method: 'POST' })
      const responseBody = await response.text()
      const responseJSON = JSON.parse(responseBody)
      const statusCode = response.status

      // assert
      assert(statusCode === 400, `Expected response status code to be 400 but was ${statusCode}`)
      assert(responseJSON.message === 'Wrong parameter client_id in query. ', `Actual response body: ${responseBody}`)
    })

    it('should return a not found response when no session found for refresh token', async function () {
      // arrange
      const grantType = 'refresh_token'
      const refreshToken = '50000000-0000-4000-86d5-286b69169198' // Needs to have a valid format
      const clientId = 'dummy_client_id'

      // act
      const response = await fetch(`${url}?grant_type=${grantType}&refresh_token=${refreshToken}&client_id=${clientId}`, { method: 'POST' })
      const responseBody = await response.text()
      const responseJSON = JSON.parse(responseBody)
      const statusCode = response.status

      // assert
      assert(statusCode === 404, `Expected response status code to be 404 but was ${statusCode}`)
      assert(responseJSON.message === 'Not found: No session was found for refresh token.', `Actual response body: ${responseBody}`)
    })

    it('should return a forbidden response when refresh token has expired', async function () {
      // arrange
      const grantType = 'refresh_token'
      const refreshToken = expiredEventId
      const clientId = 'test-client1'

      // act
      const response = await fetch(`${url}?grant_type=${grantType}&refresh_token=${refreshToken}&client_id=${clientId}`, { method: 'POST' })
      const responseBody = await response.text()
      const responseJSON = JSON.parse(responseBody)
      const statusCode = response.status

      // assert
      assert(statusCode === 403, `Expected response status code to be 403 but was ${statusCode}`)
      assert(responseJSON.message === 'Forbidden: Refresh token has expired. Unable to issue new JWT access token.', `Refresh token expired, Actual response: ${responseBody}`)
    })
  })

  describe('Excess responses', () => {
    const excessJwtLifetimeEventId = crypto.randomUUID()
    const subClaim = 'mockauth0|5e472b2d8a409e0e62026856'

    before(async function () {
      // first delete session if exists
      try {
        await postSessions.deleteSessionBySubIss(subClaim, '', issClaim)
      } catch (err) {
        // noop, this is ok if session for persona does not exist
      }
      // insert session with JWT lifetime in excess of IDP token lifetime
      const jwtLifetimeDateTime = new Date( Date.now() + 45 * 60 * 1000).toISOString() // 45 minutes in the future
      const idpExpirationDateTime = new Date( Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes in the future
      await postSessions.insertSessionBySubIss(subClaim, '', issClaim, excessJwtLifetimeEventId, jwtLifetimeDateTime, idpExpirationDateTime, 'dummy_permission:dummyA', idpToken)
    })

    after(async function () {
      try {
        await postSessions.deleteSessionBySubIss(subClaim, '', issClaim)
      } catch (err) {
        // noop, this is ok if session for persona does not exist
      }
    })

    it('should return a valid, limited response when JWT lifetime exceeds IdP lifetime', async function () {
      // TODO I think this is actually a duplicate test of 'should return a successful response'
      const grantType = 'refresh_token'
      const refreshToken = excessJwtLifetimeEventId
      const clientId = 'test-client1'

      // act
      const response = await fetch(`${url}?grant_type=${grantType}&refresh_token=${refreshToken}&client_id=${clientId}`, { method: 'POST' })
      const responseBody = await response.text()
      assert(!responseBody.startsWith('Forbidden'), 'Response body should not contain Forbidden, but is: "' + responseBody + '"')
      const statusCode = response.status
      const responseJson = JSON.parse(responseBody)
      const responseTokenType = responseJson.token_type
      const responseAccessToken = responseJson.access_token
      const responseDecodedToken = jwtDecoder.decode(responseAccessToken, { complete: true })
      const responseRefreshToken = responseJson.refresh_token
      const responseExpiresIn = responseJson.expires_in

      // assert
      assert(statusCode === 200, `Expected response status code to be 200 but was ${statusCode}`)
      assert(responseTokenType, 'The response should have contained "token_type"')
      assert(responseTokenType === 'Bearer', '"token_type" value should have been Bearer')
      assert(responseAccessToken, 'The response should have contained "access_token"')
      assert(responseDecodedToken, 'The "access_token" could not be decoded')
      assert(responseRefreshToken, 'The response should have contained "refresh_token"')
      assert(responseRefreshToken === excessJwtLifetimeEventId, 'The response"refresh_token" should have been equal to the "refresh_token" query parameter')
      assert(responseExpiresIn, 'The response should have contained "expires_in"')

      // assert
      assert(responseExpiresIn <= 1800, `Expiration lifetime returned as: ${responseExpiresIn / 60} minute${responseExpiresIn / 60 >= 2 ? 's' : ''}, expected 30 minutes less compute time`)
    })
  })

  describe('Success responses', () => {
    const validEventId = crypto.randomUUID()
    const subClaim = 'mockauth0|5e472b2d8a409e0e62026856'

    before(async function () {
      // first delete session if exists
      try {
        await postSessions.deleteSessionBySubIss(subClaim, '', issClaim)
      } catch (err) {
        // noop, this is ok if session for persona does not exist
      }
      // insert valid session
      const idpExpirationDateTime = new Date( Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes in the future
      await postSessions.insertSessionBySubIss(subClaim, '', issClaim, validEventId, new Date(), idpExpirationDateTime, 'dummy_permission:dummyA', idpToken)
    })

    after(async function () {
      try {
        await postSessions.deleteSessionBySubIss(subClaim, '', issClaim)
      } catch (err) {
        // noop, this is ok if session for persona does not exist
      }
    })

    it('should return a successful response', async function () {
      // arrange
      const grantType = 'refresh_token'
      const refreshToken = validEventId
      const clientId = 'test-client1'

      // act
      const response = await fetch(`${url}?grant_type=${grantType}&refresh_token=${refreshToken}&client_id=${clientId}`, { method: 'POST' })
      const statusCode = response.status
      const responseBody = await response.text()
      assert(!responseBody.startsWith('Forbidden'), 'Response body should not contain Forbidden, but is: "' + responseBody + '"')
      const responseJson = JSON.parse(responseBody)
      const responseTokenType = responseJson.token_type
      const responseAccessToken = responseJson.access_token
      const responseDecodedToken = jwtDecoder.decode(responseAccessToken, { complete: true })
      const responseRefreshToken = responseJson.refresh_token
      const responseExpiresIn = responseJson.expires_in

      // assert
      assert(statusCode === 200, `Expected response status code to be 200 but was ${statusCode}`)
      assert(responseTokenType, 'The response should have contained "token_type"')
      assert(responseTokenType === 'Bearer', '"token_type" value should have been Bearer')
      assert(responseAccessToken, 'The response should have contained "access_token"')
      assert(responseDecodedToken, 'The "access_token" could not be decoded')
      assert(responseRefreshToken, 'The response should have contained "refresh_token"')
      assert(responseRefreshToken === validEventId, 'The response"refresh_token" should have been equal to the "refresh_token" query parameter')
      assert(responseExpiresIn, 'The response should have contained "expires_in"')
    })
  })
})
