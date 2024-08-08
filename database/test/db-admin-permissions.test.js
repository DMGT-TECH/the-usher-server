const { describe, it, before } = require('mocha')
const assert = require('node:assert')
const adminPermissions = require('../layer/admin-permission')
const { usherDb } = require('../layer/knex')

describe('Admin permissions view', () => {
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
  })
})
