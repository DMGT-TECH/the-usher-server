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

  describe('POST:/tenants', () => {
    /**
     * HTTP request to POST:/tenants
     *
     * @param {Object} body - The request body to send
     * @param {Object} [header=requestHeaders] - The headers to include in the request
     * @returns {Promise<Response>} The response from the fetch request
     */
    const createTenant = async (body, header = requestHeaders) => {
      return await fetch(`${url}/tenants`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body)
      })
    }

    it('should return 201, successfully create a new tenant', async () => {
      const tenantPayload = {
        name: 'test-tenant-create',
        iss_claim: 'https://test-create.example.com/',
        jwks_uri: 'https://test-create.example.com/.well-known/jwks.json'
      }

      const response = await createTenant(tenantPayload)
      assert.equal(response.status, 201)

      const createdTenant = await response.json()
      assert.equal(createdTenant.name, tenantPayload.name)
      assert.equal(createdTenant.iss_claim, tenantPayload.iss_claim)
      assert.equal(createdTenant.jwks_uri, tenantPayload.jwks_uri)
      assert.ok(createdTenant.key)
      assert.ok(createdTenant.created_at)
      assert.ok(createdTenant.updated_at)

      // Clean up
      await usherDb('tenants').where({ key: createdTenant.key }).del()
    })

    it('should return 400, missing required fields', async () => {
      const invalidPayloads = [
        {}, // missing all fields
        { name: 'test-tenant' }, // missing iss_claim and jwks_uri
        { iss_claim: 'https://example.com/' }, // missing name and jwks_uri
        { jwks_uri: 'https://example.com/.well-known/jwks.json' }, // missing name and iss_claim
        { name: 'test-tenant', iss_claim: 'https://example.com/' } // missing jwks_uri
      ]

      const responses = await Promise.all(
        invalidPayloads.map(payload => createTenant(payload))
      )

      responses.forEach(response => {
        assert.equal(response.status, 400)
      })
    })

    it('should return 409, conflict for duplicate tenant', async () => {
      const tenantPayload = {
        name: 'test-tenant-duplicate',
        iss_claim: 'https://test-duplicate.example.com/',
        jwks_uri: 'https://test-duplicate.example.com/.well-known/jwks.json'
      }

      // Create the first tenant
      const response1 = await createTenant(tenantPayload)
      assert.equal(response1.status, 201)
      const createdTenant = await response1.json()

      // Try to create the same tenant again
      const response2 = await createTenant(tenantPayload)
      assert.equal(response2.status, 409)

      // Clean up
      await usherDb('tenants').where({ key: createdTenant.key }).del()
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const tenantPayload = {
        name: 'test-tenant-unauthorized',
        iss_claim: 'https://test-unauthorized.example.com/',
        jwks_uri: 'https://test-unauthorized.example.com/.well-known/jwks.json'
      }

      const response = await createTenant(tenantPayload, {
        ...requestHeaders,
        Authorization: `Bearer ${userAccessToken}`
      })
      assert.equal(response.status, 401)
    })
  })
})
