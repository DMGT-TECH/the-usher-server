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
})
