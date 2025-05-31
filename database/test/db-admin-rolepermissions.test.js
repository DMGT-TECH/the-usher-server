const assert = require('node:assert')
const { describe, it } = require('mocha')
const { usherDb } = require('../layer/knex')
const adminRolePermissions = require('../layer/admin-rolepermissions')

describe('Admin role permissions view', () => {
  describe('Test getRolePermissions', () => {
    const invalidRoleKey = 0
    it('Should return an array of permissions for the role', async function () {
      const { rolekey } = await usherDb('rolepermissions').select('*').first() || {}
      if (!rolekey) {
        this.skip()
      }
      const rolePermissions = await adminRolePermissions.getRolePermissions(rolekey)
      assert.equal(!!rolePermissions.length, true)
      assert.equal(['key', 'name', 'description', 'clientkey'].every((name) => name in rolePermissions[0]), true, 'Returned permissions should include the following fields: key, name, description, clientkey')
    })
    it('Should return an empty array', async () => {
      const rolePermissions = await adminRolePermissions.getRolePermissions(invalidRoleKey)
      assert.equal(rolePermissions.length, 0)
    })
  })

  describe('Test insertRolePermissions', () => {
    let validRoleKey
    let validPermissionKey
    const invalidRoleKey = 0
    const invalidPermissionKey = 0

    before(async () => {
      const { key: roleKey, clientkey: clientKey } = await usherDb('roles').select('key', 'clientkey').first()
      validRoleKey = roleKey
      const { key: permissionKey } = await usherDb('permissions').select('key').where({ clientkey: clientKey }).first()
      validPermissionKey = permissionKey
      await usherDb('rolepermissions').where({ rolekey: validRoleKey }).del()
    })

    it('Should return an array of inserted rolepermissions records', async () => {
      const rolePermissions = await adminRolePermissions.insertRolePermissions(validRoleKey, [validPermissionKey])
      assert.equal(rolePermissions.length, 1)
      assert.equal(rolePermissions[0].rolekey, validRoleKey)
      assert.equal(rolePermissions[0].permissionkey, validPermissionKey)
    })

    it('Should ignore the duplicate permission keys', async () => {
      const rolePermissions = await adminRolePermissions.insertRolePermissions(validRoleKey, [validPermissionKey, validPermissionKey])
      assert.equal(rolePermissions.length, 1)
    })

    it('Should handle multiple permission key inserts', async () => {
      const rolePermissions1 = await adminRolePermissions.insertRolePermissions(validRoleKey, [validPermissionKey])
      const rolePermissions2 = await adminRolePermissions.insertRolePermissions(validRoleKey, [validPermissionKey])
      assert.equal(rolePermissions1.length, 1)
      assert.equal(rolePermissions2.length, 0)
    })

    it('Should fail due to invalid role key', async () => {
      try {
        await adminRolePermissions.insertRolePermissions(invalidRoleKey, [validPermissionKey])
        assert.fail('Should fail to insertRolePermissions!')
      } catch (err) {
        assert.ok(err instanceof Error)
      }
    })

    it('Should fail due to invalid permission key', async () => {
      try {
        await adminRolePermissions.insertRolePermissions(validRoleKey, [invalidPermissionKey])
        assert.fail('Should fail to insertRolePermissions!')
      } catch (err) {
        assert.ok(err instanceof Error)
      }
    })

    afterEach(async () => {
      await usherDb('rolepermissions').where({ rolekey: validRoleKey }).del()
    })
  })

  describe('Test getPermissionsForRoleWithinSameClient', () => {
    let validRoleKey
    let validPermissionKeys
    let invalidPermissionKey
    const invalidRoleKey = 0

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

    it('Should return permissions for the given role within the same client', async () => {
      const permissions = await adminRolePermissions.getPermissionsForRoleWithinSameClient(validRoleKey, validPermissionKeys)
      assert.equal(permissions.length, validPermissionKeys.length)
      assert.ok(permissions.every(({ key }) => validPermissionKeys.includes(key)))
    })

    it('Should not include a permission that is not valid', async () => {
      const permissions = await adminRolePermissions.getPermissionsForRoleWithinSameClient(validRoleKey, [...validPermissionKeys, invalidPermissionKey])
      assert.equal(permissions.length, validPermissionKeys.length)
      assert.ok(permissions.every(({ key }) => validPermissionKeys.includes(key)))
    })

    it('Should return an empty array when permissions are invalid', async () => {
      const permissions = await adminRolePermissions.getPermissionsForRoleWithinSameClient(invalidRoleKey, [invalidPermissionKey])
      assert.equal(permissions.length, 0)
    })
  })

  describe('Test deleteRolePermissions', () => {
    let validRoleKey
    let validPermissionKey
    const invalidRoleKey = 99999
    const invalidPermissionKey = 99999

    before(async () => {
      const rolePermission = await usherDb('rolepermissions').select('rolekey', 'permissionkey').first()
      validRoleKey = rolePermission.rolekey
      validPermissionKey = rolePermission.permissionkey
    })

    afterEach(async () => {
      await usherDb('rolepermissions').insert({ rolekey: validRoleKey, permissionkey: validPermissionKey }).onConflict(['rolekey', 'permissionkey']).ignore()
    })

    it('Should delete an existing record from rolepermissions table and return 1', async () => {
      let rolePermission = await usherDb('rolepermissions').where({ rolekey: validRoleKey, permissionkey: validPermissionKey }).first()
      assert.ok(rolePermission, 'The role permission should exist')
      const deleted = await adminRolePermissions.deleteRolePermissions(validRoleKey, validPermissionKey)
      assert.equal(deleted, 1)
      rolePermission = await usherDb('rolepermissions').where({ rolekey: validRoleKey, permissionkey: validPermissionKey }).first()
      assert.ok(!rolePermission, 'The role permission should be deleted')
    })

    it('Should return 0 when deleting a non existing record for invalid permission', async () => {
      const deleted = await adminRolePermissions.deleteRolePermissions(validRoleKey, invalidPermissionKey)
      assert.equal(deleted, 0)
    })

    it('Should return 0 when deleting a non existing record for invalid role', async () => {
      const deleted = await adminRolePermissions.deleteRolePermissions(invalidRoleKey, validPermissionKey)
      assert.equal(deleted, 0)
    })
  })
})
