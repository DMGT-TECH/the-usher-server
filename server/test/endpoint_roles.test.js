const { describe, it } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')
const { getAdmin1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const dbAdminRole = require('database/layer/admin-client')

describe('Admin Roles API Tests', () => {
  const url = `${getServerUrl()}`
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
    it('Should create a new role')
    it('Should return a 400 for a duplicate role within a client')
    it('Should return a 400 for invalid client_id', async () => {
      const body = {
        client_id: 'foo',
        name: 'new-role-name',
        description: 'Created via Test case'
      }
      const response = await fetch(`${url}/roles`, { method: 'POST', body: JSON.stringify(body), headers: requestHeaders })
      assert.strictEqual(response.status, 400, 'Expected 400 error for invalid client_id')
    })
  })
})
