const { describe, it, before, afterEach } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('../../database/layer/knex')

describe('Admin Personas', () => {
  let requestHeaders;
  const url = `${getServerUrl()}`

  before(async () => {
    const userAccessToken = await getTestUser1IdPToken()
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
})
