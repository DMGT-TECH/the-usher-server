const { describe, it, before, after, afterEach } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('../../database/layer/knex')


describe('Admin Personas Permissions', () => {
  let requestHeaders
  let testPersonaKey
  const url = `${getServerUrl()}`
  const invalidPersona = 0

  before(async () => {
    const adminAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
    }
    const { key: tenantkey } = await usherDb('tenants').select('key').first()
    const [persona] = await usherDb('personas').insert({ tenantkey, sub_claim: 'personapermission@test' }).returning('key')
    testPersonaKey = persona.key
  })

  describe('GET:/personas/{persona_key}/permissions', () => {
    it('should return 200 and a list of permissions for the persona', async function () {
      const { personakey } = await usherDb('personapermissions').select('*').first() || {}
      if (!personakey) {
        this.skip()
      }
      const response = await fetch(`${url}/personas/${personakey}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 200)
      const personaPermissions = await response.json()
      assert.equal(personaPermissions.length > 0, true)
    })

    it('should return 200 and an empty array', async () => {
      const response = await fetch(`${url}/personas/${testPersonaKey}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 200)
      const personaPermissions = await response.json()
      assert.equal(personaPermissions.length, 0)
    })

    it('should return 404 and fail to get permissions for an invalid persona', async () => {
      const response = await fetch(`${url}/personas/${invalidPersona}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 404)
    })

    it('should return 401 due to lack of proper token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await fetch(`${url}/personas/${testPersonaKey}/permissions`, {
        method: 'GET',
        headers: {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        },
      })
      assert.equal(response.status, 401)
    })
  })

  describe('POST:/personas/{persona_key}/permissions', () => {
    let validPermissionKey
    const postPersonasPermissions = async (requestPayload, header = requestHeaders, personaKey = testPersonaKey) => {
      return await fetch(`${url}/personas/${personaKey}/permissions`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(requestPayload)
      })
    }

    before(async () => {
      const { key: permissionKey } = await usherDb('permissions').select('key').first()
      validPermissionKey = permissionKey
    })

    it('should return 201, empty response body, and Location header to get all the persona permissions', async () => {
      const response = await postPersonasPermissions([validPermissionKey])
      assert.equal(response.status, 201)
      assert.equal(response.headers.get('Location'), response.url)
      const responseBody = await response.text()
      assert.equal(responseBody, '')
    })

    it('should return 400, for four different invalid request payloads', async () => {
      const [emptyBodyResponse, invalidBodyResponse, invalidPermissionResponse, nonUniquePermissionsResponse] = await Promise.all(
        [
          postPersonasPermissions(),
          postPersonasPermissions({}),
          postPersonasPermissions([0]),
          postPersonasPermissions([validPermissionKey, validPermissionKey])
        ]
      )
      assert.equal([
        emptyBodyResponse.status,
        invalidBodyResponse.status,
        invalidPermissionResponse.status,
        nonUniquePermissionsResponse.status].every((status) => status === 400), true)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await postPersonasPermissions(
        [validPermissionKey],
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })

    it('should return 404, fail to create persona permissions for an invalid persona', async () => {
      const response = await postPersonasPermissions([validPermissionKey], requestHeaders, invalidPersona)
      assert.equal(response.status, 404)
    })

    it('should return 409, fail to create persona permissions due to duplication', async () => {
      await usherDb('personapermissions').insert({ personakey: testPersonaKey, permissionkey: validPermissionKey })
      const response = await postPersonasPermissions([validPermissionKey])
      assert.equal(response.status, 409)
    })

    afterEach(async () => {
      await usherDb('personapermissions').where({ personakey: testPersonaKey }).del()
    })
  })

  after(async () => {
    await usherDb('personas').where({ key: testPersonaKey }).del()
  })
})
