const { describe, it, before, after, afterEach } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('../../database/layer/knex')


describe('Admin Personas Permissions', () => {
  let requestHeaders
  let testPersonaKey
  let validPermissionKey
  let validTenantPermissions
  let inValidTenantPermission
  const validTenantKey = 1
  const url = getServerUrl()
  const invalidPersona = 999999

  before(async () => {
    const adminAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
    }
    validTenantPermissions = await usherDb('permissions as p')
      .select('p.*')
      .join('clients as c', 'p.clientkey', '=', 'c.key')
      .join('tenantclients as tc', 'c.key', '=', 'tc.clientkey')
      .whereRaw(`tc.tenantkey = ${validTenantKey}`)
    inValidTenantPermission = await usherDb('permissions as p')
      .select('p.*')
      .join('clients as c', 'p.clientkey', '=', 'c.key')
      .join('tenantclients as tc', 'c.key', '=', 'tc.clientkey')
      .whereRaw(`tc.tenantkey != ${validTenantKey}`).first()
    validPermissionKey = validTenantPermissions[0].key
    const [persona] = await usherDb('personas').insert({ tenantkey: validTenantKey, sub_claim: 'personapermission@test' }).returning('key')
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
    const postPersonasPermissions = async (requestPayload, header = requestHeaders, personaKey = testPersonaKey) => {
      return await fetch(`${url}/personas/${personaKey}/permissions`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(requestPayload)
      })
    }

    it('should return 201, empty response body, and Location header to get all the persona permissions', async () => {
      const response = await postPersonasPermissions(validTenantPermissions.map(({ key }) => key))
      assert.equal(response.status, 201)
      assert.equal(response.headers.get('Location'), response.url)
      const responseBody = await response.text()
      assert.equal(responseBody, '')
    })

    it('should return 400, a permission from a client which does not belong to the same tenant cannot be assigned to persona', async () => {
      const response = await postPersonasPermissions([...validTenantPermissions, invalidPersona].map(({ key }) => key))
      assert.equal(response.status, 400)
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

  describe('DELETE:/personas/{persona_key}/permissions/{permission_key}', () => {
    const deletePersonasPermissions = async (permissionKey, personaKey = testPersonaKey, header = requestHeaders) => {
      return await fetch(`${url}/personas/${personaKey}/permissions/${permissionKey}`, {
        method: 'DELETE',
        headers: header,
      })
    }

    it('should return 204, successful attempt to delete a persona permission', async () => {
      const response = await deletePersonasPermissions(validPermissionKey)
      assert.equal(response.status, 204)
    })

    it('should return 204, delete a persona permission successfully', async () => {
      const [newPersonaPermission] = await usherDb('personapermissions')
        .insert({ personakey: testPersonaKey, permissionkey: validPermissionKey }).returning('*')
      assert.equal(newPersonaPermission.personakey, testPersonaKey)
      const response = await deletePersonasPermissions(newPersonaPermission.permissionkey)
      assert.equal(response.status, 204)
      const personaPermission = await usherDb('personapermissions').select('*').where({ personakey: testPersonaKey, permissionkey: validPermissionKey })
      assert.equal(personaPermission.length, 0)
    })

    it('should return 400, two different invalid requests', async () => {
      const [invalidPermissionKeyResponse, invalidPersonaKeyResponse] = await Promise.all(
        [
          deletePersonasPermissions(0),
          deletePersonasPermissions(validPermissionKey, 'a'),
        ]
      )
      assert.equal([
        invalidPermissionKeyResponse.status,
        invalidPersonaKeyResponse.status].every((status) => status === 400), true)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await deletePersonasPermissions(
        validPermissionKey,
        testPersonaKey,
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })

    it('should return 404, fail to delete persona permissions for an invalid persona', async () => {
      const response = await deletePersonasPermissions(validPermissionKey, invalidPersona)
      assert.equal(response.status, 404)
    })

    afterEach(async () => {
      await usherDb('personapermissions').where({ personakey: testPersonaKey }).del()
    })
  })

  after(async () => {
    await usherDb('personas').where({ key: testPersonaKey }).del()
  })
})
