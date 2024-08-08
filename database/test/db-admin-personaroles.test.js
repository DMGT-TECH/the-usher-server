const { describe, it } = require('mocha')
const assert = require('node:assert')
const adminPersonaRoles = require('../layer/admin-personarole')
const { usherDb } = require('../layer/knex')

describe('Admin persona roles view', () => {
  describe('Test GET personas roles', () => {
    const invalidPersonaKey = 999999
    it('Should return an array of roles for the persona', async function () {
      const { personakey } = await usherDb('personaroles').select('*').first() || {}
      if (!personakey) {
        this.skip()
      }
      const personaRoles = await adminPersonaRoles.getPersonaRoles(personakey)
      assert.equal(!!personaRoles.length, true)
      const [personaRole] = personaRoles
      assert.equal(['key', 'name', 'clientkey'].every((k) => k in personaRole), true, 'key, name, clientkey should be selected for a role ')
    })
    it('Should return an empty array', async () => {
      const personaRoles = await adminPersonaRoles.getPersonaRoles(invalidPersonaKey)
      assert.equal(personaRoles.length, 0)
    })
  })

  describe('Test Insert personas roles', () => {
    let testPersonaKey
    let validRoleKey
    const invalidPersonaKey = 0
    const invalidRoleKey = 0
    before(async () => {
      const { key: roleKey } = await usherDb('roles').select('key').first()
      validRoleKey = roleKey
      const { key: tenantkey } = await usherDb('tenants').select('key').first()
      const [persona] = await usherDb('personas').insert({ tenantkey, sub_claim: 'personarole@test' }).returning('key')
      testPersonaKey = persona.key
    })

    it('Should return an array of inserted personaroles records', async () => {
      const personaRoles = await adminPersonaRoles.insertPersonaRoles(testPersonaKey, [validRoleKey])
      assert.equal(personaRoles.length, 1)
      assert.equal(personaRoles[0].personakey, testPersonaKey)
      assert.equal(personaRoles[0].rolekey, validRoleKey)
    })

    it('Should ignore the duplicate role keys', async () => {
      const personaRoles = await adminPersonaRoles.insertPersonaRoles(testPersonaKey, [validRoleKey, validRoleKey])
      assert.equal(personaRoles.length, 1)
    })

    it('Should handle multiple role key inserts', async () => {
      const personaRoles1 = await adminPersonaRoles.insertPersonaRoles(testPersonaKey, [validRoleKey])
      const personaRoles2 = await adminPersonaRoles.insertPersonaRoles(testPersonaKey, [validRoleKey])
      assert.equal(personaRoles1.length, 1)
      assert.equal(personaRoles2.length, 0)
    })

    it('Should fail due to invalid persona key', async () => {
      try {
        await adminPersonaRoles.insertPersonaRoles(invalidPersonaKey, [validRoleKey])
        assert.fail('Should fail to insertPersonaRoles!')
      } catch (err) {
        assert.equal(!!err, true)
      }
    })

    it('Should fail due to invalid role key', async () => {
      try {
        await adminPersonaRoles.insertPersonaRoles(testPersonaKey, [invalidRoleKey])
        assert.fail('Should fail to insertPersonaRoles!')
      } catch (err) {
        assert.equal(!!err, true)
      }
    })

    afterEach(async () => {
      await usherDb('personaroles').where({ personakey: testPersonaKey }).del()
    })

    after(async () => {
      await usherDb('personas').where({ key: testPersonaKey }).del()
    })
  })

  describe('Test selectPersonaRolesInTheSameTenant', () => {
    let testPersonaKey
    const validTenantKey = 1
    let validTenantRoles
    let inValidTenantRole
    before(async () => {
      validTenantRoles = await usherDb('roles as r')
        .select('r.*')
        .join('clients as c', 'r.clientkey', '=', 'c.key')
        .join('tenantclients as tc', 'c.key', '=', 'tc.clientkey')
        .whereRaw(`tc.tenantkey = ${validTenantKey}`)
      inValidTenantRole = await usherDb('roles as r')
        .select('r.*')
        .whereNotIn('r.key', validTenantRoles.map(({ key }) => key))
        .first()
      const [persona] = await usherDb('personas').insert({ tenantkey: validTenantKey, sub_claim: 'personarole@test' }).returning('key')
      testPersonaKey = persona.key
    })

    it('Should return roles that belong to the clients in the same tenant as the persona', async () => {
      const roleKeys = validTenantRoles.map((r) => r.key)
      const selectedRoles = await adminPersonaRoles.selectPersonaRolesInTheSameTenant(testPersonaKey, roleKeys)
      assert.equal(selectedRoles?.length, roleKeys.length)
      assert.ok(selectedRoles.every(({ key }) => roleKeys.includes(key)))
    })

    it('Should not include a role that does not belong to the tenant in the response', async () => {
      const roleKeys = validTenantRoles.map((r) => r.key)
      const selectedRoles = await adminPersonaRoles.selectPersonaRolesInTheSameTenant(testPersonaKey, [...roleKeys, inValidTenantRole.key])
      assert.equal(selectedRoles?.length, roleKeys.length)
      assert.ok(selectedRoles.every(({ key }) => roleKeys.includes(key)))
    })

    it('Should return an empty array since the requested role does not belong to a client in the same tenant', async () => {
      const selectedRoles = await adminPersonaRoles.selectPersonaRolesInTheSameTenant(testPersonaKey, [inValidTenantRole.key])
      assert.equal(selectedRoles?.length, 0)
    })

    after(async () => {
      await usherDb('personas').where({ key: testPersonaKey }).del()
    })
  })

  describe('Test Delete personas roles', () => {
    let testPersonaKey
    let validRoleKey
    const invalidPersonaKey = 0

    before(async () => {
      const { key: roleKey } = await usherDb('roles').select('key').first()
      validRoleKey = roleKey
      const { key: tenantkey } = await usherDb('tenants').select('key').first()
      const [persona] = await usherDb('personas').insert({ tenantkey, sub_claim: 'personarole@test' }).returning('key')
      testPersonaKey = persona.key
    })

    it('Should return 0 when there is no personaroles record to delete', async () => {
      const numberOfDeletedRecords = await adminPersonaRoles.deletePersonaRoleByKeys(invalidPersonaKey, validRoleKey)
      assert.equal(numberOfDeletedRecords, 0)
    })

    it('Should return 1 when successfully deletes a personaroles record', async () => {
      await usherDb('personaroles').insert({ personakey: testPersonaKey, rolekey: validRoleKey })
      const numberOfDeletedRecords = await adminPersonaRoles.deletePersonaRoleByKeys(testPersonaKey, validRoleKey)
      assert.equal(numberOfDeletedRecords, 1)
    })

    after(async () => {
      await usherDb('personas').where({ key: testPersonaKey }).del()
    })
  })
})
