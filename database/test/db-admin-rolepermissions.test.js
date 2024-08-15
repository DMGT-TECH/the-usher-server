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
})
