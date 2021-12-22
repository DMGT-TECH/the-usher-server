const { describe, it } = require('mocha')
const assert = require('assert')
const viewSelectEntities = require('../layer/view-select-entities')
const viewSelectRelationships = require('../layer/view-select-relationships')

describe('Tenant Personas', function () {
  describe('Test Tenant Persona Client requests', function () {
    const TUC_EXPECTED1 =
    [{
      client_id: 'test-client1',
      clientname: 'Test Client 1'
    },
    {
      client_id: 'test-client2',
      clientname: 'Test Client 2'
    }]

    it('Should return all clients for a specific tenant persona', async function () {
      let TUC_ACTUAL1 = await viewSelectRelationships.selectTenantPersonaClients('mockauth0|5e472b2d8a409e0e62026856', '', '*')
      TUC_ACTUAL1 = TUC_ACTUAL1.filter(x => x.client_id === 'test-client1' | x.client_id === 'test-client2')
      assert.strictEqual(JSON.stringify(TUC_ACTUAL1), JSON.stringify(TUC_EXPECTED1))
    })

    const TUC_EXPECTED1A =
    [{
      client_id: 'test-client1',
      clientname: 'Test Client 1'
    }, {
      client_id: 'test-client2',
      clientname: 'Test Client 2'
    }, {
      client_id: 'test-client3',
      clientname: 'Test Client 3'
    }]

    it('Should return all clients for a specific tenant sub_claim', async function () {
      const TUC_ACTUAL1A = await viewSelectRelationships.selectTenantPersonaClients('mockauth0|test-persona2-REPLACE', '*', '*')
      assert.strictEqual(JSON.stringify(TUC_ACTUAL1A), JSON.stringify(TUC_EXPECTED1A))
    })

    const TUC_EXPECTED2 =
    [{
      client_id: 'test-client2',
      clientname: 'Test Client 2'
    }]

    it('Should return just the specified client for a specific tenant persona', async function () {
      const TUC_ACTUAL2 = await viewSelectRelationships.selectTenantPersonaClients('mockauth0|test-persona2-REPLACE', '', 'test-client2')
      assert.strictEqual(JSON.stringify(TUC_ACTUAL2), JSON.stringify(TUC_EXPECTED2))
    })

    const TUC_EXPECTED3 =
    [{
      client_id: 'test-client2',
      clientname: 'Test Client 2'
    }]

    it('Should return all tenant personas of a specific client', async function () {
      const TUC_ACTUAL3 = await viewSelectRelationships.selectTenantPersonaClients('*', '', 'test-client2')
      assert.strictEqual(JSON.stringify(TUC_ACTUAL3), JSON.stringify(TUC_EXPECTED3))
    })
  })

  describe('Test Tenant Persona Client Role requests', function () {
    const TUCR_EXPECTED1 =
      [{"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|5e472b2d8a409e0e62026856","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role1","roledescription":"For testing"},
        {"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|5e472b2d8a409e0e62026856","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role2","roledescription":"For testing"},
        {"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|test-persona2-REPLACE","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role1","roledescription":"For testing"},
        {"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|test-persona2-REPLACE","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role3","roledescription":"For testing"}]

    it('Should return all tenant persona roles for a specific client', async function () {
      const TUCR_ACTUAL1 = await viewSelectRelationships.selectTenantPersonaClientRoles('*', '', 'test-client1')
      assert.strictEqual(JSON.stringify(TUCR_ACTUAL1), JSON.stringify(TUCR_EXPECTED1))
    })
  })

  describe('Test Tenant Persona Client Role Permission requests', function () {
    const TUCRP_EXPECTED1 =
      [{"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|5e472b2d8a409e0e62026856","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role1","roledescription":"For testing","permissionname":"test-permission1","permissiondescription":"For testing"},
        {"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|5e472b2d8a409e0e62026856","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role1","roledescription":"For testing","permissionname":"test-permission2","permissiondescription":"For testing"},
        {"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|5e472b2d8a409e0e62026856","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role2","roledescription":"For testing","permissionname":"test-permission3","permissiondescription":"For testing"},
        {"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|5e472b2d8a409e0e62026856","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role2","roledescription":"For testing","permissionname":"test-permission4","permissiondescription":"For testing"},
        {"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|test-persona2-REPLACE","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role1","roledescription":"For testing","permissionname":"test-permission1","permissiondescription":"For testing"},
        {"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|test-persona2-REPLACE","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role1","roledescription":"For testing","permissionname":"test-permission2","permissiondescription":"For testing"},
        {"iss_claim":"http://idp.dmgt.com.mock.localhost:3002/","tenantname":"test-tenant1","sub_claim":"mockauth0|test-persona2-REPLACE","user_context":"","client_id":"test-client1","clientname":"Test Client 1","rolename":"test-client1:test-role3","roledescription":"For testing","permissionname":"test-permission5","permissiondescription":"For testing"}]

    it('Should return all clients role permissions for a specific client', async function () {
      const TUCRP_ACTUAL1 = await viewSelectRelationships.selectTenantPersonaClientRolePermissions('*', '', 'test-client1')
      assert.strictEqual(JSON.stringify(TUCRP_ACTUAL1), JSON.stringify(TUCRP_EXPECTED1))
    })
  })

  describe('Test Tenant Persona Permission requests', function () {
    const TUCPP_EXPECTED1 =
    [{ client_id: 'test-client1', sub_claim: 'mockauth0|5e472b2d8a409e0e62026856', permissionname: 'test-permission8' }]

    it('Should return all persona permissions for a specific client', async function () {
      const TUCPP_ACTUAL1 = await viewSelectRelationships.selectTenantPersonaPermissions('test-client1', '*')
      assert.strictEqual(JSON.stringify(TUCPP_EXPECTED1), JSON.stringify(TUCPP_ACTUAL1))
    })
  })

  describe('Test issuer JWKS request', function () {
    const JWKS_EXPECTED =
    [{
      tenantname: 'test-tenant1',
      iss_claim: 'http://idp.dmgt.com.mock.localhost:3002/',
      jwks_uri: 'http://idp.dmgt.com.mock.localhost:3002/.well-known/jwks.json'
    }]

    it('Should return the JWKS url for the specified issuer', async function () {
      const JWKS_ACTUAL = await viewSelectEntities.selectIssuerJWKS('http://idp.dmgt.com.mock.localhost:3002/')
      assert.strictEqual(JSON.stringify(JWKS_ACTUAL), JSON.stringify(JWKS_EXPECTED))
    })
  })
})
