const { describe, it } = require('mocha')
const fetch = require('node-fetch')
const assert = require('node:assert')
const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const dbAdminRole = require('database/layer/admin-role')
const { usherDb } = require('database/layer/knex')

describe('Admin Roles API Tests', () => {
  const url = getServerUrl()
  let requestHeaders
  before(async () => {
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

      // delete the second Role manually. The first is deleted by `afterEach`
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

  describe('GET:/roles', () => {
    const getRoles = async (queryParam = '', header = requestHeaders) => {
      return await fetch(`${url}/roles${queryParam}`, {
        method: 'GET',
        headers: header,
      })
    }

    it('should return 200 and list of all roles', async () => {
      const response = await getRoles()
      assert.equal(response.status, 200)
      const { data: roles } = await response.json()
      assert.ok(roles?.length)
    })

    it('should return 200 and list of all roles for a client_id', async () => {
      const client = await usherDb('clients').select('*').first()
      const response = await getRoles(`?client_id=${client.client_id}`)
      assert.equal(response.status, 200)
      const { data: roles } = await response.json()
      assert.ok(roles?.length)
      assert.ok(roles.every(role => role.client_id === client.client_id))
    })

    it('should return 200 and empty list of roles for invalid client_id', async () => {
      const response = await getRoles(`?client_id=invalid`)
      assert.equal(response.status, 200)
      const { data: roles } = await response.json()
      assert.ok(roles?.length === 0)
    })

    it('should return 200 and list of all roles which includes permissions', async () => {
      const response = await getRoles('?include_permissions=true')
      assert.equal(response.status, 200)
      const { data: roles } = await response.json()
      assert.ok(roles?.length)
      assert.ok(roles.every(role => Array.isArray(role.permissions)))
    })

    it('should return 401 due to lack of proper token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await getRoles('', {
        ...requestHeaders,
        Authorization: `Bearer ${userAccessToken}`
      })
      assert.equal(response.status, 401)
    })
  })

  describe('GET:/roles/{role_key}', () => {
    let validRoleKey;
    const getRole = async (roleKey, queryParam = '', header = requestHeaders) => {
      return await fetch(`${url}/roles/${roleKey}${queryParam}`, {
        method: 'GET',
        headers: header,
      })
    }

    before(async () => {
      const role = await usherDb('roles').select('*').first()
      validRoleKey = role.key
    })

    it('should return 200 and a role', async () => {
      const response = await getRole(validRoleKey)
      assert.equal(response.status, 200)
      const role = await response.json()
      assert.ok(role.key === validRoleKey)
    })

    it('should return 200 and a role which includes permissions', async () => {
      const response = await getRole(validRoleKey, '?include_permissions=true')
      assert.equal(response.status, 200)
      const role = await response.json()
      assert.ok(role.key === validRoleKey)
      assert.ok(Array.isArray(role.permissions))
    })

    it('should return 400 for invalid role key', async () => {
      const response = await getRole('invalid_role_key')
      assert.equal(response.status, 400)
    })

    it('should return 401 due to lack of proper token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await getRole(validRoleKey, '', {
        ...requestHeaders,
        Authorization: `Bearer ${userAccessToken}`
      })
      assert.equal(response.status, 401)
    })

    it('should return 404 for nonexistence role key', async () => {
      const response = await getRole(100000)
      assert.equal(response.status, 404)
    })
  })
})
