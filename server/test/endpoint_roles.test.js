const { describe, it } = require('mocha')
const fetch = require('node-fetch')
const assert = require('node:assert')
const { getAdmin1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const dbAdminRole = require('database/layer/admin-role')

describe('Admin Roles API Tests', () => {
  const url = getServerUrl()
  let requestHeaders
  before(async function () {
    // GET IDENTITY-PROVIDER TOKEN
    const userAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`
    }
  })

  describe('Create Roles', () => {
    const clientId = 'test-client1'
    const roleName = 'Role for E2E Test'

    it('Should create a new role', async () => {
      const postBody = {
        client_id: clientId,
        name: roleName,
        description: 'the desc value'
      }

      const res = await fetch(`${url}/roles`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(postBody)
      })

      assert.strictEqual(res.status, 201)
      const role = await res.json()
      assert.ok(typeof role.key === 'number')
      assert.ok(typeof role.clientkey === 'number')
      assert.strictEqual(role.name, roleName)
    })
    it('Should create two roles with same name for different clients', async () => {
      const postBody = {
        client_id: clientId,
        name: roleName,
        description: 'the desc value'
      }

      const res = await fetch(`${url}/roles`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(postBody)
      })
      postBody.client_id = 'test-client2'
      const res2 = await fetch(`${url}/roles`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(postBody)
      })

      // delete the second Role
      await dbAdminRole.deleteRoleByClientRolename('test-client2', roleName)

      assert.strictEqual(res.status, 201)
      assert.strictEqual(res2.status, 201)
    })
    it('Should return a 400 for a duplicate role within a client', async () => {
      const postBody = {
        client_id: clientId,
        name: roleName,
        description: 'the desc value'
      }

      const res = await fetch(`${url}/roles`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(postBody)
      })

      const res2 = await fetch(`${url}/roles`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(postBody)
      })

      assert.strictEqual(res.status, 201)
      assert.strictEqual(res2.status, 400)
    })
    it('Should return a 400 for invalid client_id', async () => {
      const body = {
        client_id: 'foo',
        name: 'new-role-name',
        description: 'Created via Test case'
      }
      const response = await fetch(`${url}/roles`, { method: 'POST', body: JSON.stringify(body), headers: requestHeaders })
      assert.strictEqual(response.status, 400, 'Expected 400 error for invalid client_id')
    })

    afterEach(async () => {
      await dbAdminRole.deleteRoleByClientRolename(clientId, roleName)
    })
  })
})
