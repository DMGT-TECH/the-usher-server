const fetch = require('node-fetch')
const assert = require('node:assert')
const { describe, it, before } = require('mocha')

const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('database/layer/knex')
const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')


describe('Admin Roles Permissions', () => {
  let requestHeaders
  const url = getServerUrl()
  const nonExistingRoleKey = 0
  const invalidRoleKey = 'a'

  before(async () => {
    const adminAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
    }
  })

  describe('GET:/roles/{role_key}/permissions', () => {
    it('should return 200 and a list of permissions for the role', async function () {
      const { rolekey } = await usherDb('rolepermissions').select('*').first() || {}
      if (!rolekey) {
        this.skip()
      }
      const response = await fetch(`${url}/roles/${rolekey}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 200)
      const rolePermissions = await response.json()
      assert.equal(rolePermissions.length > 0, true)
      assert.equal(['key', 'name', 'description', 'clientkey'].every((name) => name in rolePermissions[0]), true, 'Returned permissions should include the following fields: key, name, description, clientkey')
    })

    it('should return 200 and an empty array for a role with no permissions', async function () {
      const roles = await usherDb('usher.roles as r')
        .leftJoin('usher.rolepermissions as rp', 'r.key', 'rp.rolekey')
        .whereNull('rp.rolekey')
        .select('r.*')

      if (!roles.length) {
        this.skip()
      }

      const [role] = roles;
      const response = await fetch(`${url}/roles/${role.key}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })

      assert.equal(response.status, 200)
      const rolePermissions = await response.json()
      assert.strictEqual(rolePermissions.length, 0)
    })

    it('should return 400 for an invalid role key', async () => {
      const response = await fetch(`${url}/roles/${invalidRoleKey}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 400)
    })

    it('should return 401 for a request with no Authorization header', async () => {
      const headers = { ...requestHeaders }
      delete headers.Authorization
      const response = await fetch(`${url}/roles/1/permissions`, {
        method: 'GET',
        headers
      })
      assert.equal(response.status, 401)
    })

    it('should return 401 due to invalid token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await fetch(`${url}/roles/1/permissions`, {
        method: 'GET',
        headers: {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        },
      })
      assert.equal(response.status, 401)
    })

    it('should return 404 and for a non existing role key', async () => {
      const response = await fetch(`${url}/roles/${nonExistingRoleKey}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 404)
    })
  })
})
