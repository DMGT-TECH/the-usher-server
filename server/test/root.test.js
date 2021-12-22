const { describe, it, before } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')

describe('Root Endpoint', () => {
  let userAccessToken

  before(async function () {
    // Get identity provider token
    userAccessToken = await getTestUser1IdPToken()
  })

  it('root should return 200 success', async function () {
    const url = `${getServerUrl()}/`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`
    }

    const response = await fetch(url, { method: 'GET', headers })
    const json = await response.json()

    assert.strictEqual(response.status, 200)
    assert(json.token_endpoint, 'The response should contain "token_endpoint"')
    assert(json.jwks_uri, 'The response should contain "jwks_uri"')
  })
})
