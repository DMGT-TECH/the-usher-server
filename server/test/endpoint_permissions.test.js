const { describe, it } = require('mocha')
const fetch = require('node-fetch')
const assert = require('node:assert')
const { usherDb } = require('database/layer/knex')
const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')

describe('Admin Permissions API Tests', () => {
  const url = getServerUrl()
  let requestHeaders
  before(async () => {
    const adminAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
    }
  })

  describe('GET:/permissions', () => {
    /**
     * GET /permissions
     * HTTP request to retrieve a list of permissions
     *
     * @param {string} query - The query params to be added to the URL (e.g., ?name=value1&client_id=value2&client_key=value3)
     * @param {Object} header - The request headers
     * @returns {Promise<fetch.Response>} - A Promise which resolves to fetch.Response
     */
    const getPermissions = async (query = '', header = requestHeaders) => {
      return await fetch(`${url}/permissions${query}`, {
        method: 'GET',
        headers: header,
      })
    }

    it('should return 200, return all the permissions', async () => {
      const { count: permissionCount } = await usherDb('permissions').count('*').first()
      const response = await getPermissions()
      assert.equal(response.status, 200)
      const permissions = await response.json()
      assert.equal(permissions.length, Number(permissionCount))
    })

    it('should return 200, return all the permissions for a client', async () => {
      const { client_id: validClientId, key: validClientKey } = await usherDb('clients').select('*').first()
      const { count: permissionCount } = await usherDb('permissions').where({ clientkey: validClientKey }).count('*').first()
      const response = await getPermissions(`?client_id=${validClientId}`)
      assert.equal(response.status, 200)
      const permissions = await response.json()
      assert.equal(permissions.length, Number(permissionCount))
      assert.equal(permissions[0]['client_id'], validClientId)
    })

    it('should return 200, return a permission with two filter parameters', async () => {
      const validPermission = await usherDb('permissions').select('*').first()
      const { clientkey, name } = validPermission
      const response = await getPermissions(`?client_key=${clientkey}&name=${name}`)
      assert.equal(response.status, 200)
      const permissions = await response.json()
      assert.ok(permissions.every(permission => permission.clientkey === clientkey))
      assert.ok(permissions.every(permission => permission.name === name))
    })

    it('should return 200, return an empty array for an invalid client_id', async () => {
      const response = await getPermissions('?client_id=invalid')
      assert.equal(response.status, 200)
      const permissions = await response.json()
      assert.equal(permissions.length, 0)
    })

    it('should return 400, due to an invalid query param', async () => {
      const response = await getPermissions('?client_key=string,')
      assert.equal(response.status, 400)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await getPermissions('',
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })
  })
})
