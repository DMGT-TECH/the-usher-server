const { describe, it, before, after, afterEach } = require('mocha')
const assert = require('node:assert')
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
    const invalidPermissionKey = 0
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

    it('Should ignore the duplicate permission keys', async () => {
      const personaPermissions = await adminPersonaPermissions.insertPersonaPermissions(testPersonaKey, [validPermissionKey, validPermissionKey])
      assert.equal(personaPermissions.length, 1)
    })

    it('Should handle multiple permission key inserts', async () => {
      const personaPermissions1 = await adminPersonaPermissions.insertPersonaPermissions(testPersonaKey, [validPermissionKey])
      const personaPermissions2 = await adminPersonaPermissions.insertPersonaPermissions(testPersonaKey, [validPermissionKey])
      assert.equal(personaPermissions1.length, 1)
      assert.equal(personaPermissions2.length, 0)
    })

    it('Should fail due to invalid persona key', async () => {
      try {
        await adminPersonaPermissions.insertPersonaPermissions(invalidPersonaKey, [validPermissionKey])
        assert.fail('Should fail to insertPersonaPermissions!')
      } catch (err) {
        assert.equal(!!err, true)
      }
    })

    it('Should fail due to invalid permission key', async () => {
      try {
        await adminPersonaPermissions.insertPersonaPermissions(testPersonaKey, [invalidPermissionKey])
        assert.fail('Should fail to insertPersonaPermissions!')
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

  describe('Test selectPersonaPermissionsInTheSameTenant', () => {
    let testPersonaKey
    let validTenantPermissions
    let inValidTenantPermission
    const validTenantKey = 1
    before(async () => {
      validTenantPermissions = await usherDb('permissions as p')
        .select('p.*')
        .join('clients as c', 'p.clientkey', '=', 'c.key')
        .join('tenantclients as tc', 'c.key', '=', 'tc.clientkey')
        .whereRaw(`tc.tenantkey = ${validTenantKey}`)
      inValidTenantPermission = await usherDb('permissions as p')
        .select('p.*')
        .whereNotIn('p.key', validTenantPermissions.map(({ key }) => key))
        .first()
      const [persona] = await usherDb('personas').insert({ tenantkey: validTenantKey, sub_claim: 'personapermission@test' }).returning('key')
      testPersonaKey = persona.key
    })

    it('Should return permissions that belong to the clients in the same tenant as the persona', async () => {
      const permissionKeys = validTenantPermissions.map((p) => p.key)
      const selectedPermissions = await adminPersonaPermissions.selectPersonaPermissionsInTheSameTenant(testPersonaKey, permissionKeys)
      assert.equal(selectedPermissions?.length, permissionKeys.length)
      assert.ok(selectedPermissions.every(({ key }) => permissionKeys.includes(key)))
    })

    it('Should not include a permission that does not belong to the tenant in the response', async () => {
      const permissionKeys = validTenantPermissions.map((p) => p.key)
      const selectedPermissions = await adminPersonaPermissions.selectPersonaPermissionsInTheSameTenant(testPersonaKey, [...permissionKeys, inValidTenantPermission.key])
      assert.equal(selectedPermissions?.length, permissionKeys.length)
      assert.ok(selectedPermissions.every(({ key }) => permissionKeys.includes(key)))
    })

    it('Should return an empty array since the requested permission does not belong to a client in the same tenant', async () => {
      const selectedPermissions = await adminPersonaPermissions.selectPersonaPermissionsInTheSameTenant(testPersonaKey, [inValidTenantPermission.key])
      assert.equal(selectedPermissions?.length, 0)
    })

    after(async () => {
      await usherDb('personas').where({ key: testPersonaKey }).del()
    })
  })
})
