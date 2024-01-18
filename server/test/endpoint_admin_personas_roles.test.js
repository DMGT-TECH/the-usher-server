const { describe, it, before, after } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('../../database/layer/knex')


describe('Admin Personas Roles', () => {
  let requestHeaders
  let testPersonaKey
  let validRoleKey
  let validTenantRoles
  let inValidTenantRole
  const validTenantKey = 1
  const url = getServerUrl()
  const invalidPersona = 999999

  before(async () => {
    const adminAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
    }
    validTenantRoles = await usherDb('roles as r')
      .select('r.*')
      .join('clients as c', 'r.clientkey', '=', 'c.key')
      .join('tenantclients as tc', 'c.key', '=', 'tc.clientkey')
      .whereRaw(`tc.tenantkey = ${validTenantKey}`)
    inValidTenantRole = await usherDb('roles as r')
      .select('r.*')
      .join('clients as c', 'r.clientkey', '=', 'c.key')
      .join('tenantclients as tc', 'c.key', '=', 'tc.clientkey')
      .whereRaw(`tc.tenantkey != ${validTenantKey}`).first()
    validRoleKey = validTenantRoles[0].key
    const [persona] = await usherDb('personas').insert({ tenantkey: validTenantKey, sub_claim: 'personaroles@test' }).returning('key')
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

  describe('POST:/personas/{persona_key}/roles', () => {
    const postPersonasRoles = async (requestPayload, header = requestHeaders, personaKey = testPersonaKey) => {
      return await fetch(`${url}/personas/${personaKey}/roles`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(requestPayload)
      })
    }

    it('should return 201, empty response body, and Location header to get all the persona roles', async () => {
      const response = await postPersonasRoles(validTenantRoles.map(({ key }) => key))
      assert.equal(response.status, 201)
      assert.equal(response.headers.get('Location'), response.url)
      const responseBody = await response.text()
      assert.equal(responseBody, '')
    })

    it('should return 400, a role from a client which does not belong to the same tenant cannot be assigned to persona', async () => {
      const response = await postPersonasRoles([...validTenantRoles, invalidPersona].map(({ key }) => key))
      assert.equal(response.status, 400)
    })

    it('should return 400, for four different invalid request payloads', async () => {
      const [emptyBodyResponse, invalidBodyResponse, invalidRoleResponse, nonUniqueRolesResponse] = await Promise.all(
        [
          postPersonasRoles(),
          postPersonasRoles({}),
          postPersonasRoles([0]),
          postPersonasRoles([1, 1])
        ]
      )
      assert.equal([
        emptyBodyResponse.status,
        invalidBodyResponse.status,
        invalidRoleResponse.status,
        nonUniqueRolesResponse.status].every((status) => status === 400), true)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await postPersonasRoles(
        [validRoleKey],
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })

    it('should return 404, fail to create persona roles for an invalid persona', async () => {
      const response = await postPersonasRoles([validRoleKey], requestHeaders, invalidPersona)
      assert.equal(response.status, 404)
    })

    it('should return 409, fail to create persona roles due to duplication', async () => {
      await usherDb('personaroles').insert({ personakey: testPersonaKey, rolekey: validRoleKey })
      const response = await postPersonasRoles([validRoleKey])
      assert.equal(response.status, 409)
    })

    afterEach(async () => {
      await usherDb('personaroles').where({ personakey: testPersonaKey }).del()
    })
  })

  after(async () => {
    await usherDb('personas').where({ key: testPersonaKey }).del()
  })
})
