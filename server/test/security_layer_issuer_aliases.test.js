const { describe, it, before } = require('mocha')
const fetch = require('node-fetch')
const assert = require('node:assert')
const jwtDecoder = require('jsonwebtoken')

const { getTestUser1IdPToken, getTestUser1IdPTokenFromIssuerHost } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')

describe('Accept IdP Tokens with Original and Aliased Issuer Claims', () => {
  describe('Accept Auth0 IdP Token with Original Issuer Claim', () => {
    let userAccessToken = ''
    const url = `${getServerUrl()}/self/token`

    before(async function () {
      // Get identity provider token with original issuer claim
      userAccessToken = await getTestUser1IdPToken()
    })

    it('should return a valid response', async function () {
      // arrange
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAccessToken}`,
        client_id: 'test-client1'
      }

      // act
      const response = await fetch(url, { method: 'POST', headers: headers })
      const json = await response.json()
      const tokenType = json.token_type
      const accessToken = json.access_token
      const decodedToken = jwtDecoder.decode(accessToken, { complete: true })
      const refreshToken = json.refresh_token
      const expiresIn = json.expires_in

      // assert
      assert(tokenType, 'The response should have contained "token_type"')
      assert(tokenType === 'Bearer', '"token_type" value should have been Bearer')
      assert(accessToken, 'The response should have contained "access_token"')
      assert(decodedToken, 'The "access_token" could not be decoded')
      assert(refreshToken, 'The response should have contained "refresh_token"')
      assert(expiresIn, 'The response should have contained "expires_in" but was: ' + json)
    })
  })

  describe('Accept Auth0 IdP Token with Aliased Issuer Claim', () => {
    let userAccessToken = ''
    const url = `${getServerUrl()}/self/token`

    before(async function () {
      // Get identity provider token with original issuer claim
      userAccessToken = await getTestUser1IdPTokenFromIssuerHost('http://branded-idp-alias.dmgt.com.mock.localhost:3002/')
    })

    it('should return a valid response', async function () {
      // arrange
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAccessToken}`,
        client_id: 'test-client1'
      }

      // act
      const response = await fetch(url, { method: 'POST', headers: headers })
      const json = await response.json()
      const tokenType = json.token_type
      const accessToken = json.access_token
      const decodedToken = jwtDecoder.decode(accessToken, { complete: true })
      const refreshToken = json.refresh_token
      const expiresIn = json.expires_in

      // assert
      assert(tokenType, 'The response should have contained "token_type"')
      assert(tokenType === 'Bearer', '"token_type" value should have been Bearer')
      assert(accessToken, 'The response should have contained "access_token"')
      assert(decodedToken, 'The "access_token" could not be decoded')
      assert(refreshToken, 'The response should have contained "refresh_token"')
      assert(expiresIn, 'The response should have contained "expires_in" but was: ' + json)
    })
  })

  describe('Accept Mock IdP Token with Aliased Issuer Claim', () => {
    let userAccessToken = ''
    const url = `${getServerUrl()}/self/token`

    before(async function () {
      // Get identity provider token with original issuer claim
      userAccessToken = await getTestUser1IdPTokenFromIssuerHost('http://idp.dmgt.com.mock.localhost:3002/')
    })

    it('should return a valid response', async function () {
      // arrange
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAccessToken}`,
        client_id: 'test-client1'
      }

      // act
      const response = await fetch(url, { method: 'POST', headers: headers })
      const json = await response.json()
      const tokenType = json.token_type
      const accessToken = json.access_token
      const decodedToken = jwtDecoder.decode(accessToken, { complete: true })
      const refreshToken = json.refresh_token
      const expiresIn = json.expires_in

      // assert
      assert(tokenType, 'The response should have contained "token_type"')
      assert(tokenType === 'Bearer', '"token_type" value should have been Bearer')
      assert(accessToken, 'The response should have contained "access_token"')
      assert(decodedToken, 'The "access_token" could not be decoded')
      assert(refreshToken, 'The response should have contained "refresh_token"')
      assert(expiresIn, 'The response should have contained "expires_in" but was: ' + json)
    })
  })

  /**
   * Implementing the following two tests requires us to have an additional custom domain from the IdP
   * but Auth0 only supports a single custom domain per tenant. To improve our testing coverage
   * we may need to add a second test tenant.
   */
  describe('Reject IdP Token with Aliased but Not Whitelisted Issuer Claim', () => {
    let userAccessToken = ''
    const url = `${getServerUrl()}/self/token`

    before(async function () {
      // Get identity provider token with original issuer claim
      userAccessToken = await getTestUser1IdPTokenFromIssuerHost('http://notwhitelisted.labs.dmgt.com.mock.localhost:3002/')
    })

    it('should return a valid response', async function () {
      // arrange
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAccessToken}`,
        client_id: 'test-client1'
      }

      // act
      const response = await fetch(url, { method: 'POST', headers: headers })
      const json = await response.json()
      const statusCode = response.status

      // assert
      assert(statusCode === 401, `Expected response status code to be 401 but was ${statusCode}`)
      assert(json.message.startsWith('Unauthorized: Authorization is not valid. ForbiddenError: Forbidden: JWT provided by non-whitelisted issuer'), `Actual response body: ${json}`)
    })
  })

  describe('Reject IdP Token with Whitelisted but non Aliased, non Registered Issuer Claim', () => {
    let userAccessToken = ''
    const url = `${getServerUrl()}/self/token`

    before(async function () {
      // Get identity provider token with original issuer claim
      userAccessToken = await getTestUser1IdPTokenFromIssuerHost('http://whitelisted-but-not-aliased.labs.dmgt.com.mock.localhost:3002/')
    })

    it('should return a valid response', async function () {
      // arrange
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAccessToken}`,
        client_id: 'test-client1'
      }

      // act
      const response = await fetch(url, { method: 'POST', headers: headers })
      const json = await response.json()
      const statusCode = response.status

      // assert
      assert(statusCode === 401, `Expected response status code to be 401 but was ${statusCode}`)
      assert(json.message.includes('Could not determine IdP JWKS for IdP token issuer'), `Actual response body: ${json}`)
    })
  })
})
