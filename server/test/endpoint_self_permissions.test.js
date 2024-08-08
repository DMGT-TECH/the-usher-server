const { describe, it, before } = require('mocha')
const fetch = require('node-fetch')
const assert = require('node:assert')

const { getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')

describe('Retrieve Self-Permissions', () => {
  let userAccessToken = ''
  const url = `${getServerUrl()}/self/permissions`

  before(async function () {
    // Get identity provider token
    userAccessToken = await getTestUser1IdPToken()
  })

  it('should return all permissions for the client and persona-specific permissions if no scope is given', async function () {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1',
      iss_claim: 'http://idp.dmgt.com.mock.localhost:3002/'
    }
    const response = await fetch(url, { method: 'GET', headers: headers })
    const expectedPermissions = 'test-permission1 test-permission2 test-permission3 test-permission4 test-permission8'.split(' ').sort().join(',')
    const j = (await response.json())
    const foundPermissions = j.permission.sort().join(',')
    assert(expectedPermissions === foundPermissions, `Expected permissions '${expectedPermissions}' should match those in the test database '${foundPermissions}'`)
  })
})
