const { describe, it } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')
const { getAdmin1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const dbAdminRole = require('database/layer/admin-client')

describe('Admin Clients Endpoint Test', () => {
  let userAccessToken = ''
  const url = `${getServerUrl()}`
  let requestHeaders
  before(async function () {
    // GET IDENTITY-PROVIDER TOKEN
    userAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`
    }
  })

  describe('Create Clients', () => {
    it('Should return error for missing fields', async function () {
      let body = { name: 'API Client Name' }
      const response = await fetch(`${url}/clients`, { method: 'POST', body: JSON.stringify(body), headers: requestHeaders })
      const data = await response.json()
      assert.strictEqual(response.status, 400, 'Expected 400 error response code')
    })
    it('Should return error for invalid tenant name', async function () {
      let body = {
        tenant_name: 'invalid-name',
        client_id: 'api-client-1',
        name: 'API Client Name',
        description: 'Created by Client Test suite',
        secret: '123456'
      }
      const response = await fetch(`${url}/clients`, { method: 'POST', body: JSON.stringify(body), headers: requestHeaders })
      const data = await response.json()
      // TODO change to 400 error after error handling update
      assert.strictEqual(response.status, 500, 'Expected 500 error response code')
    })
    it('Should create a Client', async function () {
      let body = {
        tenant_name: 'test-tenant1',
        client_id: 'api-client-1',
        name: 'API Client Name',
        description: 'Created by Client Test suite',
        secret: '123456'
      }
      const response = await fetch(`${url}/clients`, { method: 'POST', body: JSON.stringify(body), headers: requestHeaders })
      const data = await response.json()
      assert.strictEqual(response.status, 201, 'Expected 201 response code')
      assert.strictEqual(data.client_id, 'api-client-1', 'Expected response to contain client id')
    })

    after(async function () {
      // clean up newly created Clients
      const results = await dbAdminRole.deleteClientByClientId('api-client-1')
    })
  })

  describe('Get Client', () => {
    it('Should return 404 for invalid Client ID')
    it('Should allow usher admin to get Client object')
    it('Should allow client admin to get Client object')
  })
})
