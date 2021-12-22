const { describe, it, before } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getServerUrl } = require('./lib/urls')
const { getAdmin1IdPToken, getTestUser1IdPToken, getAdmin2IdPToken } = require('./lib/tokens')

const tokenEndpoint = `${getServerUrl()}/self/token`
const rolesEndpoint = `${getServerUrl()}/roles`
const clientsEndpoint = `${getServerUrl()}/clients`

describe('API Errors', () => {
  it('should return 405 for unknown url', async function () {
    const url = `${getServerUrl()}/foo/invalid`

    const response = await fetch(url, { method: 'GET' })
    assert(response.status === 405, `The response code should be 405, received ${response.status}`)
  })

  it('root should return 401 error if we are not authenticated', async function () {
    const url = `${getServerUrl()}/`
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    assert.strictEqual(response.status, 401)
  })

  it('/self/token should return 401 error if we are not authenticated', async function () {
    const response = await fetch(tokenEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    assert.strictEqual(response.status, 401)
  })
})

/**
 * /roles endpoints use verifyTokenForAdmin middleware
 */
describe('Validate verifyTokenForAdmin middleware', () => {
  let userAccessToken = ''
  let adminAccessToken = ''

  before(async function () {
    userAccessToken = await getTestUser1IdPToken()
    adminAccessToken = await getAdmin1IdPToken()
    return true
  })

  it('should allow access for user with valid usher-admin access', async function () {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
      client_id: 'the-usher',
      iss_claim: 'http://idp.dmgt.com.mock.localhost:3002/'
    }
    const response = await fetch(rolesEndpoint, {
      method: 'GET',
      headers: headers
    })
    assert.strictEqual(response.status, 200)
  })

  it('should return 401 error if user does not have usher-admin access', async function () {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'SXvK7prPkRPDyElECLO1rzLBKQ3bhMur',
      iss_claim: 'http://idp.dmgt.com.mock.localhost:3002/'
    }
    const response = await fetch(rolesEndpoint, {
      method: 'GET',
      headers: headers
    })
    assert.strictEqual(response.status, 401)
  })
})

/**
 * /clients/{client_id} endpoints use verifyTokenForClientAdmin middleware
 */
describe('Validate verifyTokenForClientAdmin middleware', () => {
  let userAccessToken = ''
  let adminAccessToken = ''

  before(async function () {
    userAccessToken = await getTestUser1IdPToken()
    adminAccessToken = await getAdmin2IdPToken()
    return true
  })

  it('should allow access for user with valid client-admin access', async function () {
    const clientId = 'site-iq'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
      client_id: clientId,
      iss_claim: 'http://idp.dmgt.com.mock.localhost:3002/'
    }
    const response = await fetch(`${clientsEndpoint}/${clientId}/roles`, {
      method: 'get',
      headers: headers
    })

    assert.strictEqual(response.status, 200)
  })

  it('should return 401 error if user does not have client-admin access', async function () {
    const clientId = 'site-iq'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: clientId,
      iss_claim: 'http://idp.dmgt.com.mock.localhost:3002/'
    }
    const response = await fetch(`${clientsEndpoint}/${clientId}/roles`, {
      method: 'get',
      headers: headers
    })
    assert.strictEqual(response.status, 401)
  })
})
