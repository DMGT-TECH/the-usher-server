const { describe, it, before, after, afterEach } = require('mocha')
const assert = require('assert')
const adminPersonaPermissions = require('../layer/admin-personapermission')
const { usherDb } = require('../layer/knex')

describe('Admin persona permissions view', () => {
  describe('Test GET personas permissions', () => {
    const invalidPersonaKey = 0
    it('Should return an array of permissions for the persona', async function () {
      const { personakey } = await usherDb('personapermissions').select('*').first() || {}
      if (!personakey) {
        this.skip()
      }
      const personaPermissions = await adminPersonaPermissions.getPersonaPermissions(personakey)
      assert.equal(!!personaPermissions.length, true)
    })
    it('Should return an empty array', async () => {
      const personaPermissions = await adminPersonaPermissions.getPersonaPermissions(invalidPersonaKey)
      assert.equal(personaPermissions.length, 0)
    })
  })

  describe('Test Insert personas permissions', () => {
    let testPersonaKey
    let validPermissionKey
    const invalidPersonaKey = 0
    before(async () => {
      const { key: permissionKey } = await usherDb('permissions').select('key').first()
      validPermissionKey = permissionKey
      const { key: tenantkey } = await usherDb('tenants').select('key').first()
      const [persona] = await usherDb('personas').insert({ tenantkey, sub_claim: 'personapermission@test' }).returning('key')
      testPersonaKey = persona.key
    })

    it('Should return an array of inserted personapermissions records', async () => {
      const personaPermissions = await adminPersonaPermissions.insertPersonaPermissions(testPersonaKey, [validPermissionKey])
      assert.equal(personaPermissions.length, 1)
      assert.equal(personaPermissions[0].personakey, testPersonaKey)
      assert.equal(personaPermissions[0].permissionkey, validPermissionKey)
    })

    it('Should fail due to invalid persona key', async () => {
      try {
        await adminPersonaPermissions.insertPersonaPermissions(invalidPersonaKey, [validPermissionKey])
      } catch (err) {
        assert.equal(!!err, true)
      }
    })

    it('Should fail due to duplicate permission', async () => {
      try {
        await adminPersonaPermissions.insertPersonaPermissions(testPersonaKey, [validPermissionKey, validPermissionKey])
      } catch (err) {
        assert.equal(!!err, true)
      }
    })

    afterEach(async () => {
      await usherDb('personapermissions').where({ personakey: testPersonaKey }).del()
    })

    after(async () => {
      await usherDb('personas').where({ key: testPersonaKey }).del()
    })
  })

  describe('Test Delete personas permissions', () => {
    let testPersonaKey
    let validPermissionKey
    const invalidPersonaKey = 0

    before(async () => {
      const { key: permissionKey } = await usherDb('permissions').select('key').first()
      validPermissionKey = permissionKey
      const { key: tenantkey } = await usherDb('tenants').select('key').first()
      const [persona] = await usherDb('personas').insert({ tenantkey, sub_claim: 'personapermission@test' }).returning('key')
      testPersonaKey = persona.key
    })

    it('Should return 0 when there is no personapermissions record to delete', async () => {
      const numberOfDeletedRecords = await adminPersonaPermissions.deletePersonaPermission(invalidPersonaKey, validPermissionKey)
      assert.equal(numberOfDeletedRecords, 0)
    })

    it('Should return 1 when successfully deletes a personapermissions record', async () => {
      await usherDb('personapermissions').insert({ personakey: testPersonaKey, permissionkey: validPermissionKey })
      const numberOfDeletedRecords = await adminPersonaPermissions.deletePersonaPermission(testPersonaKey, validPermissionKey)
      assert.equal(numberOfDeletedRecords, 1)
    })

    after(async () => {
      await usherDb('personas').where({ key: testPersonaKey }).del()
    })
  })
})
