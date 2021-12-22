const { describe, it, before } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')

describe('Get Self Clients', () => {
  let userAccessToken = ''
  const url = `${getServerUrl()}`

  before(async function () {
    // GET IDENTITY-PROVIDER TOKEN
    userAccessToken = await getTestUser1IdPToken()
  })

  it('should return clients', async function () {
    const requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`
    }
    const response = await fetch(`${url}/self/clients`, { method: 'GET', headers: requestHeaders })
    let actualClients = (await response.json())
    actualClients = actualClients.filter(x => x.client_id === 'test-client1' | x.client_id === 'test-client2')
    const expectedClients = [{ client_id: 'test-client1', clientname: 'Test Client 1' }, { client_id: 'test-client2', clientname: 'Test Client 2' }]
    assert.strictEqual(JSON.stringify(actualClients), JSON.stringify(expectedClients), `Expected clients: "${expectedClients}" Actual clients: "${actualClients}"`)
  })
})
