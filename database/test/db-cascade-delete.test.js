const { describe, it, before } = require('mocha')
const assert = require('node:assert')
const crypto = require('node:crypto')
// Require entities
const postTenants = require('../layer/admin-tenant')
const postClients = require('../layer/admin-client')
const postRoles = require('../layer/admin-role')
const postPermissions = require('../layer/admin-permission')
const postGroups = require('../layer/admin-group')
const postPersonas = require('../layer/admin-persona')
const postSessions = require('../layer/admin-session')
// Require relationships
const postPersonaRoles = require('../layer/admin-personarole')
const postGroupRoles = require('../layer/admin-grouprole')
const postRolePermissions = require('../layer/admin-rolepermissions')

// INSERT ENTITIES, THEN RELATIONSHIPS, THEN DELETE ENTITIES
describe('Cascade deletes', function () {
  before(async function () {
    try {
      // Insert Entities
      await postTenants.insertTenant('dummy_tenant', 'https://dummytenant', 'https://dummytenant/.well-known/jwks.json')
      await postClients.insertClient('dummy_tenant', 'dummy_client', 'Dummy Client', 'Dummy client for testing', 'secretsecretdonttell')
      await postPersonas.insertPersona('dummy_tenant', 'https://dummytenant', 'dummy_subclaim', '')
      await postRoles.insertRoleByClientId('dummy_client', 'dummy_role:dummyA', 'Dummy Role A for testing')
      await postPermissions.insertPermissionByClientId('dummy_client', 'dummy_permission:dummyA', 'Dummy Permssion A for testing')
      await postGroups.insertGroup('dummy_group', 'Dummy Group for testing')

      const idpExpirationDateTime = new Date()
      idpExpirationDateTime.setMinutes(idpExpirationDateTime.getMinutes() + 30)

      await postSessions.insertSessionBySubIss(
        'dummy_subclaim',
        '',
        'https://dummytenant',
        crypto.randomUUID(),
        new Date(),
        idpExpirationDateTime,
        'dummy_permission:dummyA',
        'eydsagdsadahdhwwgywqrwqrqrwqwqy'
      )

      // Insert relationships
      await postPersonaRoles.insertPersonaRole('dummy_tenant', 'https://dummytenant', 'dummy_subclaim', '', 'dummy_client', 'dummy_role:dummyA')
      await postGroupRoles.insertGroupRole('dummy_group', 'dummy_client', 'dummy_role:dummyA')
      await postRolePermissions.insertRolePermissionByClientId('dummy_client', 'dummy_role:dummyA', 'dummy_permission:dummyA')
    } catch (error) {
      console.log('The dummy data is unstable - try re-running the db-init.')
      console.log(error.message)
    }
  })

  it('Should delete a single specified persona', async function () {
    try {
      await postPersonas.deletePersona('dummy_tenant', 'https://dummytenant', 'dummy_subclaim', '')
      assert(true, 'Dummy persona deleted')
    } catch (error) {
      assert(false, error.message)
    }
  })
  it('Should delete a single specified role', async function () {
    try {
      const deleteResult = await postRoles.deleteRoleByClientRolename('dummy_client', 'dummy_role:dummyA')
      assert.strictEqual(deleteResult, 'Delete successful')
    } catch (error) {
      assert(false, error.message)
    }
  })
  it('Should delete a single specified permission', async function () {
    try {
      const deleteResult = await postPermissions.deletePermissionByPermissionname('dummy_client', 'dummy_permission:dummyA')
      assert.strictEqual(deleteResult, 'Delete successful')
    } catch (error) {
      assert(false, error.message)
    }
  })

  it('Should delete a single specified client', async function () {
    try {
      const deleteResult = await postClients.deleteClientByClientId('dummy_client')
      assert.strictEqual(deleteResult, 'Delete successful')
    } catch (error) {
      assert(false, error.message)
    }
  })

  it('Should delete a single specified group', async function () {
    try {
      const deleteResult = await postGroups.deleteGroupByGroupname('dummy_group')
      assert.strictEqual(deleteResult, 'Delete successful')
    } catch (error) {
      assert(false, error.message)
    }
  })
  it('Should delete a single specified tenant', async function () {
    try {
      const deleteResult = await postTenants.deleteTenant('dummy_tenant', 'https://dummytenant')
      assert.strictEqual(deleteResult, 'Delete successful')
    } catch (error) {
      assert(false, error.message)
    }
  })
})
