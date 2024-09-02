const { describe, it } = require('mocha')
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
const postTenantClients = require('../layer/admin-tenantclient')
const postPersonaRoles = require('../layer/admin-personarole')
const postGroupRoles = require('../layer/admin-grouprole')
const postRolePermissions = require('../layer/admin-rolepermissions')
const postPersonaPermissions = require('../layer/admin-personapermission')

// DUMMY ENTITIES ARE ALSO REQUIRED TO TEST RELATIONSHIP ADMIN AND WILL BE DELETED AT THE END AS DELETE TESTS
describe('Insert Update and Delete tests', function () {
  describe('Single Table Inserts', function () {
    describe('Test tenant insert', function () {
      it('Should insert a single specified tenant', async function () {
        const insertResult = await postTenants.insertTenant('dummy_tenant', 'https://dummytenant', 'https://dummytenant/.well-known/jwks.json')
        assert.strictEqual(insertResult, 'Insert successful')
        const result2 = await postTenants.insertTenant('dummy_tenant2', 'https://dummytenant2', 'https://dummytenant2/.well-known/jwks.json')
        assert.strictEqual(result2, 'Insert successful')
      })
      it('Should update a single specified tenant', async function () {
        let updateResult = await postTenants.updateTenantIssClaim('dummy_tenant', 'https://dummytenant', 'updated_iss_claim', 'updated_jwks_uri')
        assert.strictEqual(updateResult, 'Update successful')
        updateResult = await postTenants.updateTenantIssClaim('dummy_tenant', 'updated_iss_claim', 'https://dummytenant', 'https://dummytenant/.well-known/jwks.json')
        assert.strictEqual(updateResult, 'Update successful')
      })
      it('Should fail to insert a duplicate tenant', async function () {
        await postTenants.insertTenant('t1', 'iss1', 'jwks1')
        const insertResult = await postTenants.insertTenant('t1', 'iss2', 'jwks2')
        assert.strictEqual(insertResult, 'Insert failed: Tenant already exists matching tenantname t1')
        await postTenants.deleteTenant('t1', 'iss1')
      })
    })

    describe('Test client insert', function () {
      it('Should insert a single specified client', async function () {
        try {
          await postClients.insertClient('dummy_tenant', 'dummy_client', 'Dummy Client', 'Dummy client for testing', 'secretsecretdonttell')
          assert(true, 'Dummy client inserted')
        } catch (error) {
          assert(false, error.message)
        }
      })
      it('Should update a single specified client', async function () {
        try {
          await postClients.updateClientByClientId('dummy_client', { client_id: 'dummy_client', name: 'updated_clientname', description: 'updated_clientdescription', secret: 'updated_secret' })
          await postClients.updateClientByClientId('dummy_client', { client_id: 'dummy_client', name: 'Dummy Client', description: 'Dummy client for testing', secret: 'secretsecretdonttell' })
          assert(true, 'Dummy client updated and reverted')
        } catch (error) {
          assert(false, error.message)
        }
      })
    })

    describe('Test persona insert', function () {
      it('Should insert a single specified persona', async function () {
        try {
          await postPersonas.insertPersona('dummy_tenant', 'https://dummytenant', 'dummy_subclaim', '')
          assert(true, 'Dummy persona inserted')
        } catch (error) {
          assert(false, error.message)
        }
      })
    })

    describe('Test role insert', function () {
      it('Should insert a single specified role', async function () {
        try {
          await postRoles.insertRoleByClientId('dummy_client', 'dummy_role:dummyA', 'Dummy Role A for testing')
          assert(true, 'Dummy role inserted')
        } catch (error) {
          assert(false, error.message)
        }
      })
      it('Should update a single specified role', async function () {
        try {
          await postRoles.updateRoleByClientRolename('dummy_client', 'dummy_role:dummyA', 'updated_role_description')
          await postRoles.updateRoleByClientRolename('dummy_client', 'dummy_role:dummyA', 'Dummy Role A for testing')
          assert(true, 'Dummy role updated and reverted')
        } catch (error) {
          assert(false, error.message)
        }
      })
      it('Should fail to insert an existing role assigned to the client', async function () {
        try {
          await postRoles.insertRoleByClientId('dummy_client', 'dummy_role:dummyA', 'Dummy Role A for testing')
          assert(false, 'Duplicate role insert should have failed')
        } catch (error) {
          assert(true, 'Duplicate role failed to insert correctly')
        }
      })
    })

    describe('Test permission insert', function () {
      it('Should insert a single specified permission', async function () {
        const insertResult = await postPermissions.insertPermissionByClientId('dummy_client', 'dummy_permission:dummyA', 'Dummy Permission for testing')
        assert.strictEqual(insertResult, 'Insert successful')
      })
      it('Should update a single specified permission', async function () {
        await postPermissions.updatePermissionByPermissionname('dummy_client', 'dummy_permission:dummyA', 'updated_permission_description')
        const updateResult = await postPermissions.updatePermissionByPermissionname('dummy_client', 'dummy_permission:dummyA', 'Dummy Permission for testing')
        assert.strictEqual(updateResult, 'Update successful')
      })
    })

    describe('Test group insert', function () {
      it('Should insert a single specified group', async function () {
        const insertResult = await postGroups.insertGroup('dummy_group', 'Dummy Group for testing')
        assert.strictEqual(insertResult, 'Insert successful')
      })
      it('Should update a single specified group', async function () {
        await postGroups.updateGroupByGroupname('dummy_group', 'updated_group_description')
        const updateResult = await postGroups.updateGroupByGroupname('dummy_group', 'Dummy Group for testing')
        assert.strictEqual(updateResult, 'Update successful')
      })
    })

    describe('Test session insert', function () {
      const authorizationDateTime = new Date()
      const eventId = crypto.randomUUID()
      const idpExpirationDateTime = new Date()
      idpExpirationDateTime.setMinutes(idpExpirationDateTime.getMinutes() + 30)

      it('Should insert a single specified session', async function () {
        try {
          const excessAuthorizationDateTime = new Date()
          excessAuthorizationDateTime.setMinutes(excessAuthorizationDateTime.getMinutes() + 45)
          const result = await postSessions.insertSessionBySubIss(
            'dummy_subclaim',
            '',
            'https://dummytenant',
            eventId,
            excessAuthorizationDateTime,
            idpExpirationDateTime,
            'dummy_permission:dummyA',
            'eydsagdsadahdhwwgywqrwqrqrwqwqy'
          )
          assert(result, 'Inserted successfully')

          // get session
          const session = await postSessions.getSessionByEventId(eventId)
          assert.strictEqual(eventId, session.event_id)
        } catch (error) {
          assert(false, error.message)
        }
      })
      it('Should return null for invalid session event_id', async function () {
          const invalidEventId = 'invalid_event_id'
          const session = await postSessions.getSessionByEventId(invalidEventId)
          assert.strictEqual(null, session)
      })
      it('Should update a single specified session', async function () {
        const scope = 'dummy_permission:dummyA'
        const idpToken = 'eydsagdsadahdhwwgywqrwqrqrwqwqy'
        try {
          const newAuthorizationDateTime = new Date()
          const newIdpExpirationDateTime = new Date()
          newIdpExpirationDateTime.setMinutes(newIdpExpirationDateTime.getMinutes() + 15)
          await postSessions.updateSessionBySubIss('dummy_subclaim', '', 'https://dummytenant', newAuthorizationDateTime, newIdpExpirationDateTime, scope, idpToken)
          await postSessions.updateSessionBySubIss('dummy_subclaim', '', 'https://dummytenant', authorizationDateTime, idpExpirationDateTime, scope, idpToken)
          assert(true, 'Dummy session updated and reverted')
        } catch (error) {
          assert(false, error.message)
        }
      })
      it('Should get a session by sub claim, user_context, and iss', async function () {
        const session = await postSessions.getSessionBySubIss('dummy_subclaim', '', 'https://dummytenant')
        assert.strictEqual(eventId, session.event_id)
      })
    })
  })

  // TESTING OF RELATIONSHIPS. THESE DUMMY ENTRIES ARE DELETED AS THE TESTS PROGRESS
  describe('Relationship Table Inserts', function () {
    describe('Test Tenant Client insert', function () {
      it('Should insert a single relationship', async function () {
        const result2 = await postTenantClients.insertTenantClient('dummy_tenant2', 'https://dummytenant2', 'dummy_client')
        assert.strictEqual(result2, 'Insert successful')
      })
      it('Should fail to insert duplicate relationships', async function () {
        const insertResult = await postTenantClients.insertTenantClient('dummy_tenant', 'https://dummytenant', 'dummy_client')
        assert.strictEqual(insertResult, 'Insert failed: client_id = dummy_client already exists on tenantname = dummy_tenant iss_claim = https://dummytenant')
      })
      it('Should fail to insert an relationship with missing tenantname', async function () {
        const insertResult = await postTenantClients.insertTenantClient('no-tenant', 'https://dummytenant', 'dummy_client')
        assert.strictEqual(insertResult, 'Insert failed: Either or both of client_id = dummy_client; tenantname = no-tenant iss_claim = https://dummytenant does not exist')
      })
      it('Should fail to insert an relationship with missing iss_claim', async function () {
        const insertResult = await postTenantClients.insertTenantClient('dummy_tenant', 'no-issclaim', 'dummy_client')
        assert.strictEqual(insertResult, 'Insert failed: Either or both of client_id = dummy_client; tenantname = dummy_tenant iss_claim = no-issclaim does not exist')
      })
      it('Should fail to insert an relationship with missing client', async function () {
        const insertResult = await postTenantClients.insertTenantClient('dummy_tenant', 'https://dummytenant', 'no-client')
        assert.strictEqual(insertResult, 'Insert failed: Either or both of client_id = no-client; tenantname = dummy_tenant iss_claim = https://dummytenant does not exist')
      })
    })

    describe('Test Persona Role insert', function () {
      it('Should insert a single relationship', async function () {
        const insertResult = await postPersonaRoles.insertPersonaRole('dummy_tenant', 'https://dummytenant', 'dummy_subclaim', '', 'dummy_client', 'dummy_role:dummyA')
        assert.strictEqual(insertResult, 'Insert successful')
        const deleteResult = await postPersonaRoles.deletePersonaRole('dummy_tenant', 'https://dummytenant', 'dummy_subclaim', '', 'dummy_client', 'dummy_role:dummyA')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to insert where persona tenant is different than role and client tenant', async function () {
        const insertResult = await postPersonaRoles.insertPersonaRole('dummy_tenant', 'https://dummytenant', 'dummy_subclaim', '', 'the-usher', 'the-usher:usher-admin')
        assert.deepStrictEqual(insertResult, 'Insert failed: Either or all of client_id = the-usher & rolename the-usher:usher-admin; tenantname = dummy_tenant & iss_claim = https://dummytenant & sub_claim = dummy_subclaim & user_context =  does not exist')
      })
      it('Should fail when persona and client tenant are different than role tenant', async function () {
        const insertResult = await postPersonaRoles.insertPersonaRole('dummy_tenant', 'https://dummytenant', 'dummy_subclaim', '', 'dummy_client', 'the-usher:usher-admin')
        assert.deepStrictEqual(insertResult, 'Insert failed: Either or all of client_id = dummy_client & rolename the-usher:usher-admin; tenantname = dummy_tenant & iss_claim = https://dummytenant & sub_claim = dummy_subclaim & user_context =  does not exist')
      })
    })

    describe('Test Group Role insert', function () {
      it('Should insert a single relationship', async function () {
        const insertResult = await postGroupRoles.insertGroupRole('dummy_group', 'dummy_client', 'dummy_role:dummyA')
        assert.strictEqual(insertResult, 'Insert successful')
        const deleteResult = await postGroupRoles.deleteGroupRole('dummy_group', 'dummy_client', 'dummy_role:dummyA')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to insert a duplicate relationship', async function () {
        await postGroupRoles.insertGroupRole('dummy_group', 'dummy_client', 'dummy_role:dummyA')
        const insertResult = await postGroupRoles.insertGroupRole('dummy_group', 'dummy_client', 'dummy_role:dummyA')
        assert.strictEqual(insertResult, 'Insert failed: A client role client_id = dummy_client & rolename dummy_role:dummyA is already assigned to groupname dummy_group')
        const deleteResult = await postGroupRoles.deleteGroupRole('dummy_group', 'dummy_client', 'dummy_role:dummyA')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to insert an relationship with missing role', async function () {
        const insertResult = await postGroupRoles.insertGroupRole('dummy_group', 'dummy_client', 'no-role')
        assert(insertResult, 'Either or all of client_id = dummy_client & rolename no-role; groupname = dummy_group does not exist')
      })
      it('Should fail to insert an relationship with missing group', async function () {
        const insertResult = await postGroupRoles.insertGroupRole('no-group', 'dummy_client', 'dummy_role:dummyA')
        assert(insertResult, 'Either or all of client_id = dummy_client & rolename dummy_role:dummyA; groupname = no-group does not exist')
      })
    })

    describe('Test Role Permission insert', function () {
      it('Should insert a single relationship', async function () {
        const insertResult = await postRolePermissions.insertRolePermissionByClientId('dummy_client', 'dummy_role:dummyA', 'dummy_permission:dummyA')
        assert.strictEqual(insertResult, 'Insert successful')
        const deleteResult = await postRolePermissions.deleteRolePermissionByClientId('dummy_client', 'dummy_role:dummyA', 'dummy_permission:dummyA')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to insert a duplicate relationship', async function () {
        await postRolePermissions.insertRolePermissionByClientId('dummy_client', 'dummy_role:dummyA', 'dummy_permission:dummyA')
        const insertResult = await postRolePermissions.insertRolePermissionByClientId('dummy_client', 'dummy_role:dummyA', 'dummy_permission:dummyA')
        assert.strictEqual(insertResult, 'Insert failed: A client role client_id = dummy_client & rolename dummy_role:dummyA is already assigned to permissionname dummy_permission:dummyA')
        const deleteResult = await postRolePermissions.deleteRolePermissionByClientId('dummy_client', 'dummy_role:dummyA', 'dummy_permission:dummyA')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to insert an relationship with missing role', async function () {
        const insertResult = await postRolePermissions.insertRolePermissionByClientId('dummy_client', 'no-role', 'dummy_permission:dummyA')
        assert.strictEqual(insertResult, 'Insert failed: Either or all of client_id = dummy_client & rolename no-role; permissionname = dummy_permission:dummyA does not exist')
      })
      it('Should fail to insert an relationship with missing permission', async function () {
        const insertResult = await postRolePermissions.insertRolePermissionByClientId('dummy_client', 'dummy_role:dummyA', 'no-permission')
        assert.strictEqual(insertResult, 'Insert failed: Either or all of client_id = dummy_client & rolename dummy_role:dummyA; permissionname = no-permission does not exist')
      })
    })

    describe('Test Persona Permission insert', function () {
      it('Should insert a single relationship', async function () {
        const insertResult = await postPersonaPermissions.insertPersonaPermissionByClientId('dummy_client', 'dummy_subclaim', 'dummy_permission:dummyA')
        assert.strictEqual(insertResult, 'Insert successful')
        const deleteResult = await postPersonaPermissions.deletePersonaPermissionByClientId('dummy_client', 'dummy_subclaim', 'dummy_permission:dummyA')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to insert where persona tenant is different than permission and client tenant', async function () {
        const insertResult = await postPersonaPermissions.insertPersonaPermissionByClientId('dummy_client', 'auth0|test-persona2-REPLACE', 'dummy_permission:dummyA')
        assert.strictEqual(insertResult, 'Insert failed: Either or all of client_id = dummy_client; persona = auth0|test-persona2-REPLACE; permission = dummy_permission:dummyA; does not exist.')
      })
      it('Should fail when persona and client tenant are different than permission tenant', async function () {
        const insertResult = await postPersonaPermissions.insertPersonaPermissionByClientId('the-usher', 'dummy_subclaim', 'dummy_permission:dummyA')
        assert.strictEqual(insertResult, 'Insert failed: Either or all of client_id = the-usher; persona = dummy_subclaim; permission = dummy_permission:dummyA; does not exist.')
      })
    })
  })

  // DELETE DUMMY ENTITIES AND TEST EXPECTED FAILING DELETES
  describe('Single Table Deletes', function () {
    describe('Test session delete', function () {
      it('Should delete a single specified session', async function () {
        try {
          const deleteResponse = await postSessions.deleteSessionBySubIss('dummy_subclaim', '', 'https://dummytenant')
          assert.strictEqual(deleteResponse, 'Delete successful')
        } catch (error) {
          assert(false, error.message)
        }
      })
      it('Should fail to delete a non-existent session', async function () {
        try {
          await postSessions.deleteSessionBySubIss('dummy_subclaim', '', 'https://dummytenant')
          assert(false, 'This delete was expected to fail')
        } catch (error) {
          assert.strictEqual(error.message, 'Session does not exist for persona (sub_claim = dummy_subclaim user_context =  iss_claim = https://dummytenant)')
        }
      })
    })
    describe('Test persona delete', function () {
      it('Should delete a single specified persona', async function () {
        const deleteResult = await postPersonas.deletePersona('dummy_tenant', 'https://dummytenant', 'dummy_subclaim', '')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to delete a non-existant persona', async function () {
        const deleteResult = await postPersonas.deletePersona('dummy_tenant', 'https://dummytenant', 'no-subclaim', '')
        assert.strictEqual(deleteResult, 'Delete failed: A persona (sub_claim = no-subclaim; user_context = ) does not exist on tenantname dummy_tenant iss_claim https://dummytenant')
      })
      it('Should fail to delete a non-existant persona with a user_context', async function () {
        const deleteResult = await postPersonas.deletePersona('dummy_tenant', 'https://dummytenant', 'no-subclaim', 'no-userContext')
        assert.strictEqual(deleteResult, 'Delete failed: A persona (sub_claim = no-subclaim; user_context = no-userContext) does not exist on tenantname dummy_tenant iss_claim https://dummytenant')
      })
    })
    describe('Test role delete', function () {
      it('Should fail to delete a non-existent role on the client', async function () {
        const deleteResult = await postRoles.deleteRoleByClientRolename('dummy_client', 'no-role')
        assert.strictEqual(deleteResult, 'Delete failed: Rolename no-role does not exist matching client_id dummy_client')
      })
      it('Should fail to delete a role on a non-existant client', async function () {
        const deleteResult = await postRoles.deleteRoleByClientRolename('no-client', 'dummy_role:dummyA')
        assert.strictEqual(deleteResult, 'Delete failed: Rolename dummy_role:dummyA does not exist matching client_id no-client')
      })
      it('Should delete a single specified role', async function () {
        const deleteResult = await postRoles.deleteRoleByClientRolename('dummy_client', 'dummy_role:dummyA')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
    })
    describe('Test permission delete', function () {
      it('Should delete a single specified permission', async function () {
        const deleteResult = await postPermissions.deletePermissionByPermissionname('dummy_client', 'dummy_permission:dummyA')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to delete a non-existent permission', async function () {
        const deleteResult = await postPermissions.deletePermissionByPermissionname('dummy_client', 'no-permission')
        assert.strictEqual(deleteResult, 'Delete failed: Permission does not exist matching permissionname no-permission on client_id dummy_client')
      })
    })
    describe('Test client tenant delete', function () {
      it('Should delete a single client tenant', async function () {
        const result2 = await postTenantClients.deleteTenantClient('dummy_tenant2', 'https://dummytenant2', 'dummy_client')
        assert.strictEqual(result2, 'Delete successful')
      })
    })
    describe('Test client delete', function () {
      it('Should delete a single specified client', async function () {
        const deleteResult = await postClients.deleteClientByClientId('dummy_client')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to delete a non-existent client', async function () {
        const deleteResult = await postClients.deleteClientByClientId('no-client')
        assert.strictEqual(deleteResult, 'Delete failed: Client does not exist matching client_id no-client')
      })
    })
    describe('Test group delete', function () {
      it('Should delete a single specified group', async function () {
        const deleteResult = await postGroups.deleteGroupByGroupname('dummy_group')
        assert.strictEqual(deleteResult, 'Delete successful')
      })
      it('Should fail to delete a non-existent group', async function () {
        const deleteResult = await postGroups.deleteGroupByGroupname('no-group')
        assert.strictEqual(deleteResult, 'Delete failed: Group does not exist matching groupname no-group')
      })
    })
    describe('Test tenant delete', function () {
      it('Should delete a single specified tenant', async function () {
        const deleteResult = await postTenants.deleteTenant('dummy_tenant', 'https://dummytenant')
        assert.strictEqual(deleteResult, 'Delete successful')
        const result2 = await postTenants.deleteTenant('dummy_tenant2', 'https://dummytenant2')
        assert.strictEqual(result2, 'Delete successful')
      })
      it('Should fail to delete a non-existent tenant', async function () {
        const deleteResult = await postTenants.deleteTenant('no-tenant', 'https://dummytenant')
        assert.strictEqual(deleteResult, 'Delete failed: Tenant does not exist matching tenantname no-tenant or iss_claim https://dummytenant')
      })
    })
  })
})
