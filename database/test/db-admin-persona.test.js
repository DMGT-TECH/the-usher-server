const { describe, it, before, after, afterEach } = require('mocha')
const assert = require('assert')
const adminPersonas = require('../layer/admin-persona')
const { usherDb } = require('../layer/knex')

describe('Admin persona view', () => {
  describe('Test INSERT personas', () => {
    it('Should insert persona without an exception', async () => {
      const insertResult = await adminPersonas.insertPersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'test-dmgt-oocto-1@dmgtoocto.com', '')
      assert.strictEqual(insertResult, 'Insert successful')
      await adminPersonas.deletePersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'test-dmgt-oocto-1@dmgtoocto.com', '')
    })
    it('Should fail to insert for a nonexistent tenant', async () => {
      const insertResult = await adminPersonas.insertPersona('test-tenant1 Non-existent', 'http://idp.dmgt.com.mock.localhost:3002/', 'test-dmgt-oocto-3@dmgtoocto.com', '')
      assert.strictEqual(insertResult, 'Insert failed: Tenant does not exist matching tenantname test-tenant1 Non-existent iss_claim http://idp.dmgt.com.mock.localhost:3002/')
    })
    it('Should fail to insert duplicate tenant/persona combination - check tenantname', async () => {
      await adminPersonas.insertPersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'test-dmgt-oocto-x@dmgtoocto.com', '')
      const result = await adminPersonas.insertPersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'test-dmgt-oocto-x@dmgtoocto.com', '')
      assert.strictEqual(result, 'Insert failed: A persona (sub_claim = test-dmgt-oocto-x@dmgtoocto.com; user_context = ) already exists on tenantname test-tenant1 iss_claim http://idp.dmgt.com.mock.localhost:3002/')
      await adminPersonas.deletePersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'test-dmgt-oocto-x@dmgtoocto.com', '')
    })
    it('Should insert persona by tenant key without an exception', async () => {
      const subClaim = 'test-user@the-usher.com'
      const [tenant] = await usherDb('tenants').select('*').limit(1)
      const persona = await adminPersonas.insertPersonaByTenantKey(tenant.key, subClaim)
      assert.strictEqual(persona.sub_claim, subClaim)
      await usherDb('personas').where({ key: persona.key }).del()
    })
  })

  describe('Test UPDATE personas', () => {
    it('Should update persona without an exception by tenantname', async () => {
      await adminPersonas.insertPersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'test-dmgt-oocto-5@dmgtoocto.com', '')
      const resultTenantname = await adminPersonas.updatePersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'test-dmgt-oocto-5@dmgtoocto.com', 'test-dmgt-oocto-7@dmgtoocto.com', '', '')
      assert.strictEqual(resultTenantname, 'Update successful')
      await adminPersonas.deletePersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'test-dmgt-oocto-7@dmgtoocto.com', '')
    })
    it('Should fail to update for a nonexistent tenant', async () => {
      const resultTenantname = await adminPersonas.updatePersona('test-tenant1 Non-existent', 'http://idp.dmgt.com.mock.localhost:3002/', 'auth0|test-persona2-REPLACE', 'should_not_replace_sub_claim', '', '')
      assert.strictEqual(resultTenantname, 'Update failed: A persona (sub_claim = auth0|test-persona2-REPLACE; user_context = ) does not exist on tenantname test-tenant1 Non-existent iss_claim http://idp.dmgt.com.mock.localhost:3002/')
    })
    it('Should fail to update for a nonexistent persona', async () => {
      const resultTenantname = await adminPersonas.updatePersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'does-not-exist@dmgtoocto.com', 'should_not_replace_sub_claim', '', '')
      assert.strictEqual(resultTenantname, 'Update failed: A persona (sub_claim = does-not-exist@dmgtoocto.com; user_context = ) does not exist on tenantname test-tenant1 iss_claim http://idp.dmgt.com.mock.localhost:3002/')
    })
  })

  describe('Test DELETE personas', () => {
    it('Should fail to delete a persona not linked to a tenant', async () => {
      const resultDelete = await adminPersonas.deletePersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'no-persona@dmgtoocto.com', '')
      assert.strictEqual(resultDelete, 'Delete failed: A persona (sub_claim = no-persona@dmgtoocto.com; user_context = ) does not exist on tenantname test-tenant1 iss_claim http://idp.dmgt.com.mock.localhost:3002/')
    })
  })

  describe('Test GET personas', () => {
    const invalidPersonaKey = 0
    it('Should return a valid persona', async () => {
      const persona = await adminPersonas.getPersona(1)
      assert.strictEqual(persona.key, 1)
    })
    it('Should return undefined for invalid persona key', async () => {
      const persona = await adminPersonas.getPersona(invalidPersonaKey)
      assert.strictEqual(persona, undefined)
    })
  })

  describe('Test Delete personas by key', () => {
    let testPersonaKey
    let validPermissionKey
    let validRoleKey
    let validTenantKey
    const invalidPersonaKey = 999999

    before(async () => {
      const { key: permissionKey } = await usherDb('permissions').select('key').first()
      validPermissionKey = permissionKey
      const { key: roleKey } = await usherDb('roles').select('key').first()
      validRoleKey = roleKey
      const { key: tenantKey } = await usherDb('tenants').select('key').first()
      validTenantKey = tenantKey
    })

    beforeEach(async () => {
      const [persona] = await usherDb('personas').insert({ tenantkey: validTenantKey, sub_claim: 'persona@test' }).returning('key')
      testPersonaKey = persona.key
    })

    it('Should return 0 when there is no persona record to delete', async () => {
      const numberOfDeletedRecords = await adminPersonas.deletePersonaByKey(invalidPersonaKey)
      assert.equal(numberOfDeletedRecords, 0)
    })

    it('Should return 1 when successfully deletes a persona record', async () => {
      const numberOfDeletedRecords = await adminPersonas.deletePersonaByKey(testPersonaKey)
      assert.equal(numberOfDeletedRecords, 1)
    })

    it('Should delete persona and cascade delete personapermission records', async () => {
      await usherDb('personapermissions').insert({ personakey: testPersonaKey, permissionkey: validPermissionKey })
      const numberOfDeletedRecords = await adminPersonas.deletePersonaByKey(testPersonaKey)
      assert.equal(numberOfDeletedRecords, 1)
      const personaPermission = await usherDb('personapermissions').select('*').where({ personakey: testPersonaKey })
      assert.equal(personaPermission.length, 0)
    })

    it('Should delete persona and cascade delete personarole records', async () => {
      await usherDb('personaroles').insert({ personakey: testPersonaKey, rolekey: validRoleKey })
      const numberOfDeletedRecords = await adminPersonas.deletePersonaByKey(testPersonaKey)
      assert.equal(numberOfDeletedRecords, 1)
      const personaRole = await usherDb('personaroles').select('*').where({ personakey: testPersonaKey })
      assert.equal(personaRole.length, 0)
    })

    afterEach(async () => {
      await usherDb('personas').where({ key: testPersonaKey }).del()
    })
  })
})
