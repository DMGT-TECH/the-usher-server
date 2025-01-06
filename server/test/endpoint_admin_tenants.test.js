const { describe, it, before } = require('mocha')
const fetch = require('node-fetch')
const assert = require('node:assert')
const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('../../database/layer/knex')

describe('Admin Tenants', () => {
  let requestHeaders
  const url = getServerUrl()

  before(async () => {
    const adminAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
    }
  })

  describe('GET:/tenants', () => {
    /**
     * HTTP request to GET:/tenants
     *
     * @param {string} [query=''] - The query string to append to the URL.
     * @param {Object} [header=requestHeaders] - The headers to include in the request.
     * @returns {Promise<Response>} The response from the fetch request.
     */
    const getTenants = async (query = '', header = requestHeaders) => {
      return await fetch(`${url}/tenants${query}`, {
        method: 'GET',
        headers: header,
      })
    }

    it('should return 200, return all tenants without filters', async () => {
      const { count: totalCount } = await usherDb('tenants').count('*').first()
      const response = await getTenants()
      assert.equal(response.status, 200)
      const tenants = await response.json()
      assert.equal(tenants.length, Number(totalCount))
    })

    it('should return 200, return tenants filtered by key', async () => {
      const { key: validKey } = await usherDb('tenants').select('key').first()
      const response = await getTenants(`?key=${validKey}`)
      assert.equal(response.status, 200)
      const [tenant] = await response.json()
      assert.equal(tenant.key, validKey)
    })

    it('should return 200, return tenants filtered by name', async () => {
      const { name: validName } = await usherDb('tenants').select('name').first()
      const response = await getTenants(`?name=${validName}`)
      assert.equal(response.status, 200)
      const [tenant] = await response.json()
      assert.equal(tenant.name, validName)
    })

    it('should return 200, return tenants filtered by iss_claim', async () => {
      const { iss_claim: validIssClaim } = await usherDb('tenants').select('iss_claim').first()
      const response = await getTenants(`?iss_claim=${validIssClaim}`)
      assert.equal(response.status, 200)
      const [tenant] = await response.json()
      assert.equal(tenant.iss_claim, validIssClaim)
    })

    it('should return 200, return tenants filtered by encoded iss_claim', async () => {
      const { iss_claim: validIssClaim } = await usherDb('tenants').select('iss_claim').first()
      const encodedIssClaim = encodeURIComponent(validIssClaim)
      assert.notEqual(validIssClaim, encodedIssClaim)
      const response = await getTenants(`?iss_claim=${encodedIssClaim}`)
      assert.equal(response.status, 200)
      const [tenant] = await response.json()
      assert.equal(tenant.iss_claim, validIssClaim)
    })

    it('should return 200, return tenants sorted by specified field and order', async () => {
      const sort = 'created_at'
      const order = 'desc'
      const response = await getTenants(`?sort=${sort}&order=${order}`)
      assert.equal(response.status, 200)
      const tenants = await response.json()
      for (let i = 1; i < tenants.length; i++) {
        assert.ok(tenants[i - 1][sort] >= tenants[i][sort])
      }
    })

    it('should return 400, due to invalid query params', async () => {
      const responses = await Promise.all(
        [
          getTenants('?key=NaN'),
          getTenants('?sort=not_key'),
          getTenants('?sort=key&order'),
          getTenants('?sort=key&order=not_asc_desc'),
        ]
      )
      assert.equal(responses.every(({ status }) => status === 400), true)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await getTenants('',
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })
  })
})
