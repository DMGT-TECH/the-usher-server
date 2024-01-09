const { describe, it, before, after } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('../../database/layer/knex')


describe('Admin Personas Roles', () => {
  let requestHeaders
  let testPersonaKey
  const url = getServerUrl()
  const invalidPersona = 999999

  before(async () => {
    const adminAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
    }
    const { key: tenantkey } = await usherDb('tenants').select('key').first()
    const [persona] = await usherDb('personas').insert({ tenantkey, sub_claim: 'personaroles@test' }).returning('key')
    testPersonaKey = persona.key
  })

  describe('GET:/personas/{persona_key}/roles', () => {
    const getPersonasRoles = async (personaKey = testPersonaKey, header = requestHeaders) => {
      return await fetch(`${url}/personas/${personaKey}/roles`, {
        method: 'GET',
        headers: header,
      })
    }

    it('should return 200 and a list of roles for the persona', async function () {
      const { personakey } = await usherDb('personaroles').select('*').first() || {}
      if (!personakey) {
        this.skip()
      }
      const response = await getPersonasRoles(personakey)
      assert.equal(response.status, 200)
      const personaRoles = await response.json()
      assert.equal(!!personaRoles?.length, true)
    })

    it('should return 200 and an empty array', async () => {
      const response = await getPersonasRoles(testPersonaKey)
      assert.equal(response.status, 200)
      const personaRoles = await response.json()
      assert.equal(personaRoles.length, 0)
    })

    it('should return 400 due to invalid path parameter', async () => {
      const response = await getPersonasRoles('a')
      assert.equal(response.status, 400)
    })

    it('should return 401 due to lack of proper token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await getPersonasRoles(testPersonaKey, {
        ...requestHeaders,
        Authorization: `Bearer ${userAccessToken}`
      })
      assert.equal(response.status, 401)
    })

    it('should return 404 due to invalid persona key', async () => {
      const response = await getPersonasRoles(invalidPersona)
      assert.equal(response.status, 404)
    })
  })

  after(async () => {
    await usherDb('personas').where({ key: testPersonaKey }).del()
  })
})
