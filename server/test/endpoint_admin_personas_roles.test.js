const { describe, it, before, after } = require('mocha')
const fetch = require('node-fetch')
const assert = require('node:assert')

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
      .whereNotIn('r.key', validTenantRoles.map(({ key }) => key))
      .first()
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

  describe('PUT:/personas/{persona_key}/roles', () => {
    const putPersonasRoles = async (requestPayload, header = requestHeaders, personaKey = testPersonaKey) => {
      return await fetch(`${url}/personas/${personaKey}/roles`, {
        method: 'PUT',
        headers: header,
        body: JSON.stringify(requestPayload)
      })
    }

    it('should return 204, empty response body, and Location header to get all the persona roles', async () => {
      const response = await putPersonasRoles(validTenantRoles.map(({ key }) => key))
      assert.equal(response.status, 204)
      assert.equal(response.headers.get('Location'), response.url)
      const responseBody = await response.text()
      assert.equal(responseBody, '')
    })

    it('should return 204, should be able to handle duplicated keys in the body', async () => {
      const response = await putPersonasRoles([validRoleKey, validRoleKey])
      assert.equal(response.status, 204)
    })

    it('should return 204, ignore to create persona roles that already exist', async () => {
      await usherDb('personaroles').insert({ personakey: testPersonaKey, rolekey: validRoleKey })
      const response = await putPersonasRoles([validRoleKey])
      assert.equal(response.status, 204)
    })

    it('should return 400, a role from a client which does not belong to the same tenant cannot be assigned to persona', async () => {
      const response = await putPersonasRoles([...validTenantRoles, inValidTenantRole].map(({ key }) => key))
      assert.equal(response.status, 400)
    })

    it('should return 400, for four different invalid request payloads', async () => {
      const [emptyBodyResponse, invalidBodyResponse, invalidRoleResponse] = await Promise.all(
        [
          putPersonasRoles(),
          putPersonasRoles({}),
          putPersonasRoles([0]),
        ]
      )
      assert.equal([
        emptyBodyResponse.status,
        invalidBodyResponse.status,
        invalidRoleResponse.status].every((status) => status === 400), true)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await putPersonasRoles(
        [validRoleKey],
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })

    it('should return 404, fail to create persona roles for an invalid persona', async () => {
      const response = await putPersonasRoles([validRoleKey], requestHeaders, invalidPersona)
      assert.equal(response.status, 404)
    })

    afterEach(async () => {
      await usherDb('personaroles').where({ personakey: testPersonaKey }).del()
    })
  })

  describe('DELETE:/personas/{persona_key}/roles/{role_key}', () => {
    /**
     * Helper function to make an HTTPS request to delete a persona role.
     *
     * @param {string} roleKey - The role key
     * @param {string} personaKey - The persona key
     * @param {Object} header - The request headers
     * @returns {Promise<Response>} - A promise that resolves to the HTTP response
     */
    const deletePersonasRoles = async (roleKey, personaKey = testPersonaKey, header = requestHeaders) => {
      return await fetch(`${url}/personas/${personaKey}/roles/${roleKey}`, {
        method: 'DELETE',
        headers: header,
      })
    }

    it('should return 204, successful attempt to delete a persona role', async () => {
      const response = await deletePersonasRoles(validRoleKey)
      assert.equal(response.status, 204)
    })

    it('should return 204, delete a persona role successfully', async () => {
      const [newPersonaRole] = await usherDb('personaroles')
        .insert({ personakey: testPersonaKey, rolekey: validRoleKey }).returning('*')
      assert.equal(newPersonaRole.personakey, testPersonaKey)
      const response = await deletePersonasRoles(newPersonaRole.rolekey)
      assert.equal(response.status, 204)
      const personaRole = await usherDb('personaroles').select('*').where({ personakey: testPersonaKey, rolekey: validRoleKey })
      assert.equal(personaRole.length, 0)
    })

    it('should return 400, two different invalid requests', async () => {
      const [invalidRoleKeyResponse, invalidPersonaKeyResponse] = await Promise.all(
        [
          deletePersonasRoles('a'),
          deletePersonasRoles(validRoleKey, 'a'),
        ]
      )
      assert.equal([
        invalidRoleKeyResponse.status,
        invalidPersonaKeyResponse.status].every((status) => status === 400), true)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await deletePersonasRoles(
        validRoleKey,
        testPersonaKey,
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })

    it('should return 404, fail to delete persona roles for an invalid persona', async () => {
      const response = await deletePersonasRoles(validRoleKey, invalidPersona)
      assert.equal(response.status, 404)
    })

    afterEach(async () => {
      await usherDb('personaroles').where({ personakey: testPersonaKey }).del()
    })
  })

  after(async () => {
    await usherDb('personas').where({ key: testPersonaKey }).del()
  })
})
