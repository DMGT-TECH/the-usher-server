const { describe, it, before } = require('mocha')
const assert = require('node:assert')
const adminPermissions = require('../layer/admin-permission')
const { usherDb } = require('../layer/knex')

describe('Admin permissions view', () => {
  let validClientKey
  let permissionTableColumns

  before(async () => {
    const { key: clientKey } = await usherDb('clients').select('key').first()
    validClientKey = clientKey
    permissionTableColumns = Object.keys(await usherDb('permissions').columnInfo())
  })

  describe('Test Get permission', () => {
    let validPermissionKey

    before(async () => {
      const { key: permissionKey } = await usherDb('permissions').select('key').first()
      validPermissionKey = permissionKey
    })

    it('Should return a permission successfully', async () => {
      const permission = await adminPermissions.getPermission(validPermissionKey)
      assert.equal(permission.key, validPermissionKey)
    })

    it('Should return undefined for invalid permissionKey', async () => {
      const permission = await adminPermissions.getPermission(0)
      assert.equal(permission, undefined)
    })

    it('Should get the permissions for a role key', async () => {
      const { rolekey, permission_count } = await usherDb('rolepermissions')
        .select('rolekey')
        .count('permissionkey as permission_count')
        .groupBy('rolekey')
        .orderBy('permission_count', 'desc')
        .first()
      const permissions = await adminPermissions.getPermissionsByRoleKey(rolekey)
      assert.equal(permission_count, permissions.length)
    })
  })

  describe('Insert Permission', () => {
    it('Should insert a new permission successfully', async () => {
      const permissionObject = {
        name: 'Test Permission',
        clientkey: validClientKey,
        description: 'A test permission',
      }
      const insertedPermission = await adminPermissions.insertPermission(permissionObject)
      assert.equal(insertedPermission.name, permissionObject.name)
      assert.equal(insertedPermission.clientkey, permissionObject.clientkey)
      assert.equal(insertedPermission.description, permissionObject.description)
      assert.ok(permissionTableColumns.every((col) => col in insertedPermission))
      await usherDb('permissions').where({ key: insertedPermission.key }).del()
    })

    it('Should throw an error when inserting a permission with invalid clientkey', async () => {
      const invalidPermissionObject = {
        name: 'Invalid Test Permission',
        clientkey: null,
        description: 'This should fail',
      }
      try {
        await adminPermissions.insertPermission(invalidPermissionObject)
        assert.fail('Expected an error but did not get one')
      } catch (err) {
        assert.ok(err instanceof Error)
      }
    })
  })

  describe('Get Permissions by Name and Client Key', () => {
    it('Should return permissions for a given name and clientkey', async () => {
      const permission = await usherDb('permissions').select('*').first()
      const permissions = await adminPermissions.getPermissionsByNameClientKey(
        permission.name,
        permission.clientkey
      )
      assert.ok(permissions.length > 0)
      assert.equal(permissions[0].name, permission.name)
      assert.equal(permissions[0].clientkey, permission.clientkey)
      assert.ok(permissionTableColumns.every((col) => col in permissions[0]))
    })

    it('Should return an empty array if no permissions match the criteria', async () => {
      const permissions = await adminPermissions.getPermissionsByNameClientKey('Nonexistent Name', 99999)
      assert.deepEqual(permissions, [])
    })
  })
})
