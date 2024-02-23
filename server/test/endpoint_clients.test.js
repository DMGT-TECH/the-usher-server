const { describe, it } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')
const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const dbAdminRole = require('database/layer/admin-client')
const { usherDb } = require('../../database/layer/knex')

describe('Admin Clients Endpoint Test', () => {
  let userAccessToken = ''
  const url = getServerUrl()
  let requestHeaders
  before(async () => {
    // GET IDENTITY-PROVIDER TOKEN
    userAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`
    }
  })

  describe('Create Clients', () => {
    it('Should return error for missing fields', async () => {
      let body = { name: 'API Client Name' }
      const response = await fetch(`${url}/clients`, { method: 'POST', body: JSON.stringify(body), headers: requestHeaders })
      await response.json()
      assert.strictEqual(response.status, 400, 'Expected 400 error response code')
    })
    it('Should return error for invalid tenant name', async () => {
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
    it('Should create a Client', async () => {
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

    it('should return an error for invalid client id', async () => {
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

    after(async () => {
      // clean up newly created Clients
      await dbAdminRole.deleteClientByClientId('api-client-1')
    })
  })

  describe('Get Client', () => {
    it('Should return 404 for invalid Client ID', async () => {
      const clientId = 'foo-invalid-id'
      const response = await fetch(`${url}/clients/${clientId}`, { method: 'GET', headers: requestHeaders })
      assert.strictEqual(response.status, 404, 'Expected 404 response code')
    })
    it('Should allow usher admin to get Client object', async () => {
      const clientId = 'test-client1'
      const response = await fetch(`${url}/clients/${clientId}`, { method: 'GET', headers: requestHeaders })
      const data = await response.json()
      assert.strictEqual(response.status, 200, 'Expected 200 response code')
      assert.strictEqual(data.client_id, 'test-client1', 'Expected valid client id value')
    })
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

  describe('Update Client', () => {
    let testClient
    /**
     * PUT /clients/{:client_id}
     * HTTP request to Update a client by its client_id
     *
     * @param {string} clientId - The subject client id which needs to be updated
     * @param {string} payload - The request body payload to update a client
     * @param {Object} header - The request headers
     * @returns {Promise<fetch.response>} - A Promise which resolves to fetch.response
     */
    const updateClient = async (clientId, payload = { client_id: testClient?.client_id, name: testClient?.name }, header = requestHeaders) => {
      return await fetch(`${url}/clients/${clientId}`, {
        method: 'PUT',
        headers: header,
        body: JSON.stringify(payload)
      })
    }

    beforeEach(async () => {
      testClient = (await usherDb('clients').insert({
        client_id: 'test_client_id',
        name: 'test_client_name',
        description: 'test_client_description',
        secret: 'test_client_secret',
      }).returning('*'))[0]
    })

    it('should return 200, update the client information', async () => {
      const newClientInfo = {
        client_id: 'updated_client_id',
        name: 'updated_client_name',
        description: 'updated_client_description',
        secret: 'updated_client_secret',
      }
      const response = await updateClient(testClient.client_id, newClientInfo)
      assert.equal(response.status, 200)
      testClient.client_id = newClientInfo.client_id
      const updatedClient = await response.json();
      Object.entries(newClientInfo).forEach(([key, val]) => {
        assert.equal(updatedClient[key], val)
      })
    })

    it('should return 400, for invalid payloads', async () => {
      const invalidRequestsResponses = await Promise.all([
        updateClient(testClient.client_id, ''),
        updateClient(testClient.client_id, {}),
        updateClient(testClient.client_id, { name: 'test' }),
        updateClient(testClient.client_id, { client_id: 'test' }),
        updateClient(testClient.client_id, { client_id: 'test', name: 1 }),
        updateClient(testClient.client_id, { client_id: 1, name: 'test' }),
      ])
      invalidRequestsResponses.forEach(({ status }) => assert.equal(status, 400))
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await updateClient(testClient.client_id, testClient,
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })

    it('should return 404, for invalid client_id', async () => {
      const response = await updateClient('invalid_client_id')
      assert.equal(response.status, 404)
    })

    it('should return 409, to update client_id if it already exist', async () => {
      const { client_id: existingClientId } = await usherDb('clients').select('client_id').first()
      const response = await updateClient(testClient.client_id, { ...testClient, client_id: existingClientId })
      assert.equal(response.status, 409)
    })

    afterEach(async () => {
      await usherDb('clients').where({ client_id: testClient.client_id }).del()
    })
  })
})
