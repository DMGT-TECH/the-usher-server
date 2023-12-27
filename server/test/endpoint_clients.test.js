const { describe, it } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')
const { getAdmin1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const dbAdminRole = require('database/layer/admin-client')

describe('Admin Clients Endpoint Test', () => {
  let userAccessToken = ''
  const url = getServerUrl()
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

    it('should return an error for invalid client id', async function () {
      let body = {
        tenant_name: '',
        client_id: 'name with spaces',
        name: 'This should fail',
        description: 'Created by Client Test suite',
        secret: '123456'
      }
      const response = await fetch(`${url}/clients`, { method: 'POST', body: JSON.stringify(body), headers: requestHeaders })
      assert.strictEqual(response.status, 400, 'Expected 400 response code')
    })

    after(async function () {
      // clean up newly created Clients
      const results = await dbAdminRole.deleteClientByClientId('api-client-1')
    })
  })

  describe('Get Client', () => {
    it('Should return 404 for invalid Client ID', async function () {
      const clientId = 'foo-invalid-id'
      const response = await fetch(`${url}/clients/${clientId}`, { method: 'GET', headers: requestHeaders })
      assert.strictEqual(response.status, 404, 'Expected 404 response code')
    })
    it('Should allow usher admin to get Client object', async function () {
      const clientId = 'test-client1'
      const response = await fetch(`${url}/clients/${clientId}`, { method: 'GET', headers: requestHeaders })
      const data = await response.json()
      assert.strictEqual(response.status, 200, 'Expected 200 response code')
      assert.strictEqual(data.client_id, 'test-client1', 'Expected valid client id value')
    })
    it('Should allow client admin to get Client object')
  })

  describe('Delete Client', () => {
    it('Should delete a Client and associated data', async () => {
      const clientId = 'test-delete-api'
      //create a client manually
      const client = await dbAdminRole.insertClient('test-tenant1', clientId, 'Test Client for Delete API', null, '123456')

      const response = await fetch(`${url}/clients/${clientId}`, { method: 'DELETE', headers: requestHeaders })
      assert.strictEqual(response.status, 204, 'Expected 204 response code')
    })
    it('Should return 404 for invalid Client ID', async () => {
      const clientId = 'foo-invalid-id'
      const response = await fetch(`${url}/clients/${clientId}`, { method: 'DELETE', headers: requestHeaders })
      assert.strictEqual(response.status, 404, 'Expected 404 response code')
    })
  })
})
