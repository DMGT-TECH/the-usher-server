const { describe, it, before, afterEach } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('../../database/layer/knex')

describe('Admin Personas', () => {
  let requestHeaders
  const url = getServerUrl()

  before(async () => {
    const userAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
    }
  })

  describe('POST:/personas', () => {
    const validPersonaPayload = {
      'sub_claim': 'test-persona@the-usher-server.com',
      'tenant_key': 1,
    }

    it('should return 201 - create a persona', async () => {
      const response = await fetch(`${url}/personas`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(validPersonaPayload)
      })
      assert.strictEqual(response.status, 201)
      const persona = await response.json()
      assert.strictEqual(persona.sub_claim, validPersonaPayload.sub_claim)
    })

    it('should return 400 - fail to create a persona due to invalid tenant', async () => {
      const response = await fetch(`${url}/personas`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          ...validPersonaPayload,
          'tenant_key': 1000,
        })
      })
      assert.strictEqual(response.status, 400)
    })

    it('should return 409 - fail to create persona due to conflict', async () => {
      const { sub_claim, tenant_key: tenantkey } = validPersonaPayload
      await usherDb('personas').insert({ sub_claim, tenantkey })
      const response = await fetch(`${url}/personas`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(validPersonaPayload)
      })
      assert.strictEqual(response.status, 409)
    })

    afterEach(async () => {
      try {
        await usherDb('personas').where({ sub_claim: validPersonaPayload.sub_claim }).del()
      } catch { }
    })
  })

  describe('DELETE:/personas/{persona_key}', () => {
    let testPersonaKey
    let validTenantKey
    const invalidPersonaKey = 999999
    /**
     * DELETE /personas/{:key}
     * HTTP request to delete a persona by its persona_key
     *
     * @param {string} personaKey - The key of the persona to be deleted
     * @param {Object} header - The request headers
     * @returns {Promise<fetch.response>} - A Promise which resolves to fetch.response
     */
    const deletePersona = async (personaKey = testPersonaKey, header = requestHeaders) => {
      return await fetch(`${url}/personas/${personaKey}`, {
        method: 'DELETE',
        headers: header,
      })
    }

    before(async () => {
      const { key } = await usherDb('tenants').select('key').first()
      validTenantKey = key
    })

    beforeEach(async () => {
      const [persona] = await usherDb('personas').insert({ tenantkey: validTenantKey, sub_claim: 'persona@test' }).returning('key')
      testPersonaKey = persona.key
    })

    it('should return 204, successfully deletes a persona', async () => {
      const response = await deletePersona(testPersonaKey)
      assert.equal(response.status, 204)
      const personas = await usherDb('personas').select('*').where({ key: testPersonaKey })
      assert.equal(personas.length, 0)
    })

    it('should return 400, for invalid persona_key path parameter', async () => {
      const response = await deletePersona('a')
      assert.equal(response.status, 400)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await deletePersona(
        testPersonaKey,
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })

    it('should return 404, persona does not exist to delete', async () => {
      const response = await deletePersona(invalidPersonaKey)
      assert.equal(response.status, 404)
    })

    afterEach(async () => {
      await usherDb('personas').where({ key: testPersonaKey }).del()
    })
  })

  describe('GET:/personas', () => {
    /**
     * GET /personas
     * HTTP request to retrieve a list of personas
     *
     * @param {string} query - The query params to be added to the URL (E.g. ?filter=tenantname:value1,sub_claim:value2&sort=sub_claim&order=desc)
     * @param {Object} header - The request headers
     * @returns {Promise<fetch.response>} - A Promise which resolves to fetch.response
     */
    const getPersonas = async (query = '', header = requestHeaders) => {
      return await fetch(`${url}/personas${query}`, {
        method: 'GET',
        headers: header,
      })
    }

    it('should return 200, return all the personas', async () => {
      const { count: totalCount } = await usherDb('personas').count('*').first()
      const response = await getPersonas()
      assert.equal(response.status, 200)
      const personas = await response.json()
      assert.equal(personas.length, Number(totalCount))
    })

    it('should return 200, return all the personas for a tenant', async () => {
      const { name: validTenantName, key: tenantkey } = await usherDb('tenants').select('*').first()
      const { count: totalCount } = await usherDb('personas').where({ tenantkey }).count('*').first()
      const response = await getPersonas(`?filter=tenantname:${validTenantName}`)
      assert.equal(response.status, 200)
      const personas = await response.json()
      assert.equal(personas.length, Number(totalCount))
      assert.equal(personas[0]['tenantname'], validTenantName)
    })

    it('should return 200, return empty array for invalid tennatname', async () => {
      const response = await getPersonas('?filter=tenantname:invalid')
      assert.equal(response.status, 200)
      const personas = await response.json()
      assert.equal(personas.length, 0)
    })

    it('should return 200, return a sorted list based on created_at in descending order ', async () => {
      const sort = 'created_at'
      const response = await getPersonas(`?sort=${sort}&order=desc`)
      assert.equal(response.status, 200)
      const personas = await response.json()
      for (let i = 1; i < personas.length; i++) {
        assert.ok(personas[i - 1][sort] >= personas[i][sort])
      }
    })

    it('should return 400, due to invalid query params', async () => {
      const responses = await Promise.all(
        [
          getPersonas('?filter='),
          getPersonas('?filter=tenant'),
          getPersonas('?filter=tenantname:'),
          getPersonas('?filter=tenantname:test,'),
          getPersonas('?filter=tenantname:test&sort=invalidField'),
          getPersonas('?sort=key,'),
          getPersonas('?sort=key&order'),
          getPersonas('?sort=key&order=not_asc_desc'),

        ]
      )
      assert.equal(responses.every(({ status }) => status === 400), true)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await getPersonas('',
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })
  })
})
