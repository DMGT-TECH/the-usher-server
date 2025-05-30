const fetch = require('node-fetch')
const assert = require('node:assert')
const { describe, it, before, afterEach } = require('mocha')

const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('database/layer/knex')
const { getAdmin1IdPToken, getTestUser1IdPToken } = require('./lib/tokens')


describe('Admin Roles Permissions', () => {
  let requestHeaders
  const url = getServerUrl()
  const nonExistingRoleKey = 0
  const invalidRoleKey = 'a'

  before(async () => {
    const adminAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
    }
  })

  describe('GET:/roles/{role_key}/permissions', () => {
    it('should return 200 and a list of permissions for the role', async function () {
      const { rolekey } = await usherDb('rolepermissions').select('*').first() || {}
      if (!rolekey) {
        this.skip()
      }
      const response = await fetch(`${url}/roles/${rolekey}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 200)
      const rolePermissions = await response.json()
      assert.equal(rolePermissions.length > 0, true)
      assert.equal(['key', 'name', 'description', 'clientkey'].every((name) => name in rolePermissions[0]), true, 'Returned permissions should include the following fields: key, name, description, clientkey')
    })

    it('should return 200 and an empty array for a role with no permissions', async function () {
      const roles = await usherDb('usher.roles as r')
        .leftJoin('usher.rolepermissions as rp', 'r.key', 'rp.rolekey')
        .whereNull('rp.rolekey')
        .select('r.*')

      if (!roles.length) {
        this.skip()
      }

      const [role] = roles;
      const response = await fetch(`${url}/roles/${role.key}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })

      assert.equal(response.status, 200)
      const rolePermissions = await response.json()
      assert.strictEqual(rolePermissions.length, 0)
    })

    it('should return 400 for an invalid role key', async () => {
      const response = await fetch(`${url}/roles/${invalidRoleKey}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 400)
    })

    it('should return 401 for a request with no Authorization header', async () => {
      const headers = { ...requestHeaders }
      delete headers.Authorization
      const response = await fetch(`${url}/roles/1/permissions`, {
        method: 'GET',
        headers
      })
      assert.equal(response.status, 401)
    })

    it('should return 401 due to invalid token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await fetch(`${url}/roles/1/permissions`, {
        method: 'GET',
        headers: {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        },
      })
      assert.equal(response.status, 401)
    })

    it('should return 404 and for a non existing role key', async () => {
      const response = await fetch(`${url}/roles/${nonExistingRoleKey}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 404)
    })
  })

  describe('PUT:/roles/{role_key}/permissions', () => {
    let validRoleKey
    let validPermissionKeys
    let invalidPermissionKey
    const invalidRoleKey = 0

    const putRolesPermissions = async (requestPayload, header = requestHeaders, roleKey = validRoleKey) => {
      return await fetch(`${url}/roles/${roleKey}/permissions`, {
        method: 'PUT',
        headers: header,
        body: JSON.stringify(requestPayload)
      })
    }

    before(async () => {
      const { key: roleKey, clientkey: clientKey } = await usherDb('roles').select('key', 'clientkey').first()
      validRoleKey = roleKey

      const permissions = await usherDb('permissions').select('key').where({ clientkey: clientKey }).limit(2)
      validPermissionKeys = permissions.map((p) => p.key)

      invalidPermissionKey = (await usherDb('permissions')
        .select('key')
        .whereNot({ clientkey: clientKey })
        .first()).key
    })

    it('should return 204, empty response body, and Location header to get all the role permissions', async () => {
      const response = await putRolesPermissions(validPermissionKeys)
      assert.equal(response.status, 204)
      assert.equal(response.headers.get('Location'), response.url)
      const responseBody = await response.text()
      assert.equal(responseBody, '')
    })

    it('should return 204, should be able to handle duplicate keys in the body', async () => {
      const response = await putRolesPermissions([...validPermissionKeys, ...validPermissionKeys])
      assert.equal(response.status, 204)
    })

    it('should return 204, ignore to create role permissions that already exist', async () => {
      await putRolesPermissions(validPermissionKeys)
      const response = await putRolesPermissions(validPermissionKeys)
      assert.equal(response.status, 204)
    })

    it('should return 400, a permission does not belong to the same client as the role', async () => {
      const response = await putRolesPermissions([...validPermissionKeys, invalidPermissionKey])
      assert.equal(response.status, 400)
    })

    it('should return 400, for three different invalid request payloads', async () => {
      const [emptyBodyResponse, invalidBodyResponse, invalidPermissionResponse] = await Promise.all(
        [
          putRolesPermissions(),
          putRolesPermissions({}),
          putRolesPermissions([invalidPermissionKey]),
        ]
      )
      assert.ok([
        emptyBodyResponse.status,
        invalidBodyResponse.status,
        invalidPermissionResponse.status].every((status) => status === 400))
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await putRolesPermissions(
        validPermissionKeys,
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })

    it('should return 404, fail to create role permissions for an invalid role', async () => {
      const response = await putRolesPermissions(validPermissionKeys, requestHeaders, invalidRoleKey)
      assert.equal(response.status, 404)
    })

    afterEach(async () => {
      await usherDb('rolepermissions').where({ rolekey: validRoleKey }).del()
    })
  })

  describe('DELETE:/roles/{role_key}/permissions/{permission_key}', () => {
    let validRoleKey
    let validPermissionKey
    const invalidRoleKey = 99999
    const invalidPermissionKey = 99999

    const deleteRolesPermissions = async (permissionKey, roleKey = validRoleKey, header = requestHeaders) => {
      return await fetch(`${url}/roles/${roleKey}/permissions/${permissionKey}`, {
        method: 'DELETE',
        headers: header,
      })
    }

    before(async () => {
      const rolePermission = await usherDb('rolepermissions').select('rolekey', 'permissionkey').first()
      validRoleKey = rolePermission.rolekey
      validPermissionKey = rolePermission.permissionkey
    })

    afterEach(async () => {
      await usherDb('rolepermissions').insert({ rolekey: validRoleKey, permissionkey: validPermissionKey }).onConflict(['rolekey', 'permissionkey']).ignore()
    })

    it('should return 204, successful attempt to delete a role permission', async () => {
      let rolePermission = await usherDb('rolepermissions').where({ rolekey: validRoleKey, permissionkey: validPermissionKey }).first()
      assert.ok(rolePermission, 'Role permission should exist in database')
      const response = await deleteRolesPermissions(validPermissionKey)
      assert.equal(response.status, 204)
      rolePermission = await usherDb('rolepermissions').where({ rolekey: validRoleKey, permissionkey: validPermissionKey }).first()
      assert.ok(!rolePermission, 'Role permission should be deleted from the database')
      const locationUrl = `${url}/roles/${validRoleKey}/permissions`
      assert.equal(response.headers.get('Location'), locationUrl)
    })

    it('should return 204, idempotent API', async () => {
      const response = await deleteRolesPermissions(invalidPermissionKey)
      assert.equal(response.status, 204)
    })

    it('should return 400, three bad requests', async () => {
      const responses = await Promise.all(
        [
          deleteRolesPermissions(0),
          deleteRolesPermissions('a'),
          deleteRolesPermissions(validPermissionKey, 'a'),
        ]
      )
      assert.equal(responses.every(({ status }) => status === 400), true)
    })

    it('should return 401, unauthorized token', async () => {
      const userAccessToken = await getTestUser1IdPToken()
      const response = await deleteRolesPermissions(
        validPermissionKey,
        validRoleKey,
        {
          ...requestHeaders,
          Authorization: `Bearer ${userAccessToken}`
        })
      assert.equal(response.status, 401)
    })

    it('should return 404, fail to delete role permissions for an invalid role', async () => {
      const response = await deleteRolesPermissions(validPermissionKey, invalidRoleKey)
      assert.equal(response.status, 404)
    })
  })
})
