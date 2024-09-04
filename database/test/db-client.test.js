const { describe, it } = require('mocha')
const assert = require('node:assert')
const viewSelectEntities = require('../layer/view-select-entities')
const viewSelectRelationships = require('../layer/view-select-relationships')

describe('Clients', function () {
  describe('Test client requests', function () {
    const CLIENT_EXPECTED1 =
    [{
      client_id: 'test-client1',
      clientname: 'Test Client 1',
      description: 'For testing',
      secret: 'aaaaaaaaaaaaaaaa'
    }]

    it('Should return a single specified client', async function () {
      const CLIENT_ACTUAL1 = await viewSelectEntities.selectClients('test-client1')
      assert.strictEqual(JSON.stringify(CLIENT_ACTUAL1), JSON.stringify(CLIENT_EXPECTED1))
    })

    it('Should return multiple clients', async function () {
      const results = await viewSelectEntities.selectClients()
      assert(results.length >= 1, 'Expected more than one client')
    })
  })

  describe('Test Client Roles requests', function () {
    const CLIENT_EXPECTED2 =
    [{ client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role1', roledescription: 'For testing' },
      { client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role2', roledescription: 'For testing' },
      { client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role3', roledescription: 'For testing' }]

    it('Should return all roles for the specified client', async function () {
      const CLIENT_ACTUAL2 = await viewSelectRelationships.selectClientRoles('test-client1')
      assert.strictEqual(JSON.stringify(CLIENT_ACTUAL2), JSON.stringify(CLIENT_EXPECTED2))
    })
  })

  describe('Test Client Roles requests', function () {
    const CLIENT_EXPECTED4 =
    [{ client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role1', roledescription: 'For testing' }]

    it('Should return single specified role for the specified client', async function () {
      const CLIENT_ACTUAL4 = await viewSelectRelationships.selectClientRoles('test-client1', 'test-client1:test-role1')
      assert.strictEqual(JSON.stringify(CLIENT_ACTUAL4), JSON.stringify(CLIENT_EXPECTED4))
    })
  })

  describe('Test Client Role Permission requests', function () {
    const CLIENT_EXPECTED3 =
    [{ client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role1', roledescription: 'For testing', permissionname: 'test-permission1', permissiondescription: 'For testing' },
      { client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role1', roledescription: 'For testing', permissionname: 'test-permission2', permissiondescription: 'For testing' },
      { client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role2', roledescription: 'For testing', permissionname: 'test-permission3', permissiondescription: 'For testing' },
      { client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role2', roledescription: 'For testing', permissionname: 'test-permission4', permissiondescription: 'For testing' },
      { client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role3', roledescription: 'For testing', permissionname: 'test-permission5', permissiondescription: 'For testing' }]

    it('Should return all roles and permissions for the specified client', async function () {
      const CLIENT_ACTUAL3 = await viewSelectRelationships.selectClientRolePermissions('test-client1')
      assert.strictEqual(JSON.stringify(CLIENT_ACTUAL3), JSON.stringify(CLIENT_EXPECTED3))
    })
  })

  describe('Test Client Role Permission requests', function () {
    const CLIENT_EXPECTED5 =
    [{ client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role1', roledescription: 'For testing', permissionname: 'test-permission1', permissiondescription: 'For testing' },
      { client_id: 'test-client1', clientname: 'Test Client 1', rolename: 'test-client1:test-role1', roledescription: 'For testing', permissionname: 'test-permission2', permissiondescription: 'For testing' }]

    it('Should return all roles and permissions for the specified client', async function () {
      const CLIENT_ACTUAL5 = await viewSelectRelationships.selectClientRolePermissions('test-client1', 'test-client1:test-role1')
      assert.strictEqual(JSON.stringify(CLIENT_ACTUAL5), JSON.stringify(CLIENT_EXPECTED5))
    })
  })
})
