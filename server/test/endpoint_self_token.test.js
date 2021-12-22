const { describe, it, before } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')
const jwtDecoder = require('jsonwebtoken')

const { getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')

describe('Issue Self Token', () => {
  let userAccessToken = ''
  const url = `${getServerUrl()}/self/token`

  before(async function () {
    // Get identity provider token
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

  it('should return an access token with azp', async function () {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1'
    }
    const response = await fetch(url, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    assert(decodedToken.payload.azp === 'test-client1', 'Authorized party (azp) should equal client_id of request.')
  })

  it('should return an access token with scope', async function () {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1'
    }
    const response = await fetch(url, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    const expectedPermissions = 'test-permission1 test-permission2 test-permission3 test-permission4 test-permission8'.split(' ').sort().join(',')
    const foundPermissions = decodedToken.payload.scope.split(' ').sort().join(',')
    assert(expectedPermissions === foundPermissions, `Expected permissions '${expectedPermissions}' should match those in the test database '${foundPermissions}'`)
  })

  it('should return only requested permissions when scope parameter specified', async function () {
    // arrange
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1'
    }
    const requestedScope = 'test-permission1'

    // act
    const response = await fetch(`${url}?scope=${requestedScope}`, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    const returnedScope = decodedToken.payload.scope

    // assert
    assert(requestedScope === returnedScope, `Requested scope '${requestedScope}' but returned scope was '${returnedScope}'`)
    assert(requestedScope === response.headers.get('x-oauth-scopes'))
  })

  it('should return only requested the role(s) corresponding to the granted scope parameter permission (1/3)', async function () {
    // arrange
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1'
    }
    const requestedScope = 'test-permission1'
    const expectedRoles = 'test-client1:test-role1'

    // act
    const response = await fetch(`${url}?scope=${requestedScope}`, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    const returnedRoles = decodedToken.payload.roles

    // assert
    assert(expectedRoles === returnedRoles, `Expected roles was '${expectedRoles}' but returned roles was '${returnedRoles}'`)
  })

  it('should return only requested the role(s) corresponding to the granted scope parameter permission (2/3)', async function () {
    // arrange
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1'
    }
    const requestedScope = 'test-permission3'
    const expectedRoles = 'test-client1:test-role2'

    // act
    const response = await fetch(`${url}?scope=${requestedScope}`, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    const returnedRoles = decodedToken.payload.roles

    // assert
    assert(expectedRoles === returnedRoles, `Expected roles was '${expectedRoles}' but returned roles was '${returnedRoles}'`)
  })

  it('should return only requested the role(s) corresponding to the granted scope parameter permission (3/3)', async function () {
    // arrange
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1'
    }
    const requestedScope = 'test-permission1%20test-permission3'
    const expectedRoles = 'test-client1:test-role1 test-client1:test-role2'

    // act
    const response = await fetch(`${url}?scope=${requestedScope}`, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    const returnedRoles = decodedToken.payload.roles

    // assert
    assert(expectedRoles === returnedRoles, `Expected roles was '${expectedRoles}' but returned roles was '${returnedRoles}'`)
  })

  it('should return all entitled permissions when no scope parameter specified', async function () {
    // arrange
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1'
    }
    const expectedScope = 'test-permission1 test-permission2 test-permission3 test-permission4 test-permission8'

    // act
    const response = await fetch(url, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    const returnedScope = decodedToken.payload.scope

    // assert
    assert(expectedScope === returnedScope, `Expected scope '${expectedScope}' but returned scope was '${returnedScope}'`)
    assert(expectedScope === response.headers.get('x-oauth-scopes'))
  })

  it('should return all entitled permissions across all clients with wildcard client_id when no scope parameter specified', async function () {
    // arrange
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: '*'
    }
    const expectedScope = 'test-permission1 test-permission2 test-permission3 test-permission4 test-permission6 test-permission7 test-permission8'

    // act

    const response = await fetch(url, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    const returnedScope = decodedToken.payload.scope

    // assert
    assert(expectedScope.split(' ').sort().join(',') === returnedScope.split(' ').sort().join(','), `Expected scope '${expectedScope}' but returned scope was '${returnedScope}'`)
    assert(expectedScope === response.headers.get('x-oauth-scopes'))
  })

  it('should return permissions in scope across two clients with wildcard client_id when scope parameter is specified', async function () {
    // arrange
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: '*'
    }
    const permissionFromClient1 = 'test-permission1'
    const permissionFromClient2 = 'test-permission6'
    const requestedScope = `${permissionFromClient1} ${permissionFromClient2}`
    const expectedScope = requestedScope

    // act
    const response = await fetch(`${url}?scope=${requestedScope}`, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    const returnedScope = decodedToken.payload.scope

    // assert
    assert(expectedScope.split(' ').sort().join(',') === returnedScope.split(' ').sort().join(','), `Expected scope '${expectedScope}' but returned scope was '${returnedScope}'`)
    assert(expectedScope === response.headers.get('x-oauth-scopes'))
  })

  it('should return a token which will expire in the future', async function () {
    // arrange
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1'
    }

    // act
    const response = await fetch(url, { method: 'POST', headers: headers })
    const usherTokenString = (await response.json()).access_token
    const decodedToken = jwtDecoder.decode(usherTokenString, { complete: true })
    const tokenExpiry = decodedToken.payload.exp
    const expirationTime = new Date(tokenExpiry * 1000)
    const dateNow = new Date()

    // assert
    assert(expirationTime > dateNow, `Expiration time '${expirationTime}' should have been in the future compared to '${dateNow}'`)
  })
})
