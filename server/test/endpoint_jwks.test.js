const { describe, it } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getServerUrl } = require('./lib/urls')

describe('Get JWKS', () => {
  const url = `${getServerUrl()}/.well-known/jwks.json`

  it('should return a JWKS containing a list of keys', async function () {
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    assert.strictEqual(response.status, 200)
    const jwks = await response.json()
    assert('keys' in jwks, 'There should be a keys element in the object.')
    assert(jwks.keys.length > 0, 'There should be at least one key in the keys array')
  })
})
