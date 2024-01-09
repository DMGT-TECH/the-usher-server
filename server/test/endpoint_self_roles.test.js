const { describe, it, before } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')

describe('Get Self Roles', () => {
  let userAccessToken = ''
  const url = getServerUrl()

  before(async function () {
    // GET IDENTITY-PROVIDER TOKEN
    userAccessToken = await getTestUser1IdPToken()
  })

  it('should return roles for given client_id', async function () {
    const requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: 'test-client1',
    }
    const response = await fetch(`${url}/self/roles`, { method: 'GET', headers: requestHeaders })
    let actualRoles = (await response.json()).data

    // verify the role names are expected
    const actualNames = actualRoles.map(r => r.name)
    const expectedNames = ['test-client1:test-role1', 'test-client1:test-role2']
    assert.strictEqual(JSON.stringify(actualNames), JSON.stringify(expectedNames), `Expected roles: "${expectedNames}" Actual roles: "${actualNames}"`)
  })

  it('should return roles for any client', async function () {
    const requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
      client_id: '*',
    }
    const response = await fetch(`${url}/self/roles`, { method: 'GET', headers: requestHeaders })
    let actualRoles = (await response.json()).data

    // verify the role names are expected
    const actualNames = actualRoles.map(r => r.name)
    const expectedNames = ['test-client1:test-role1', 'test-client1:test-role2', 'test-client2:test-role1', 'test-client3:test-role1']
    assert.strictEqual(JSON.stringify(actualNames), JSON.stringify(expectedNames), `Expected roles: "${expectedNames}" Actual roles: "${actualNames}"`)
  })
})
