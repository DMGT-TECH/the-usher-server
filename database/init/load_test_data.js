// Require entities
const postTenants = require('../layer/admin-tenant')
const postClients = require('../layer/admin-client')
const postRoles = require('../layer/admin-role')
const postPermissions = require('../layer/admin-permission')
const postPersonas = require('../layer/admin-persona')
// Require relationships
const postTenantClients = require('../layer/admin-tenantclient')
const postPersonaRoles = require('../layer/admin-personarole')
const postRolePermissions = require('../layer/admin-rolepermission')
const postPersonaPermissions = require('../layer/admin-personapermission')
const testClearUp = require('./delete_data')

module.exports = { loadTestData, deleteTestData }

async function deleteTestData () {
  try {
    const clearUp = await testClearUp.deleteTestData()
    console.log(clearUp)
  } catch (error) {
    throw new Error('Test data failed to delete ' + error.message)
  }
}

async function loadTestData () {
  try {
    await loadTenantData()
    await loadClientData()
    await loadRoleData()
    await loadPermissionData()
    await loadPersonaData()
    await loadTenantClientData()
    await loadRolePermissionData()
    await loadPersonaRoleData()
    await loadPersonaPermissionData()
    console.log('The test data is loaded and ready to use')
  } catch (error) {
    throw new Error('Test data failed to load ' + error.message)
  }
}

async function loadClientData () {
  try {
    await postClients.insertClient('test-tenant1', 'test-client1', 'Test Client 1', 'For testing', 'aaaaaaaaaaaaaaaa')
    await postClients.insertClient('test-tenant1', 'test-client2', 'Test Client 2', 'For testing', 'bbbbbbbbbbbbbb')
    await postClients.insertClient('test-tenant1', 'test-client3', 'Test Client 3', 'For testing', 'cccccccccc')
    return null
  } catch (error) {
    throw new Error('Client data failed to load ' + error.message)
  }
}

async function loadRoleData () {
  try {
    await postRoles.insertRoleByClientId('test-client1', 'test-client1:test-role1', 'For testing')
    await postRoles.insertRoleByClientId('test-client1', 'test-client1:test-role2', 'For testing')
    await postRoles.insertRoleByClientId('test-client1', 'test-client1:test-role3', 'For testing')
    await postRoles.insertRoleByClientId('test-client2', 'test-client2:test-role1', 'For testing')
    await postRoles.insertRoleByClientId('test-client2', 'test-client2:test-role2', 'For testing')
    await postRoles.insertRoleByClientId('test-client2', 'test-client2:test-role3', 'For testing')
    await postRoles.insertRoleByClientId('test-client3', 'test-client3:test-role1', 'For testing')
    return null
  } catch (error) {
    throw new Error('Role data failed to load ' + error.message)
  }
}

async function loadPermissionData () {
  try {
    await postPermissions.insertPermissionByClientId('test-client1', 'test-permission1', 'For testing')
    await postPermissions.insertPermissionByClientId('test-client1', 'test-permission2', 'For testing')
    await postPermissions.insertPermissionByClientId('test-client1', 'test-permission3', 'For testing')
    await postPermissions.insertPermissionByClientId('test-client1', 'test-permission4', 'For testing')
    await postPermissions.insertPermissionByClientId('test-client1', 'test-permission5', 'For testing')
    await postPermissions.insertPermissionByClientId('test-client1', 'test-permission8', 'For testing  Persona Permissions')
    await postPermissions.insertPermissionByClientId('test-client2', 'test-permission5', 'For testing')
    await postPermissions.insertPermissionByClientId('test-client2', 'test-permission6', 'For testing')
    await postPermissions.insertPermissionByClientId('test-client2', 'test-permission7', 'For testing')
    await postPermissions.insertPermissionByClientId('test-client3', 'test-permission7', 'For testing')
  } catch (error) {
    throw new Error('Permission data failed to load ' + error.message)
  }
}

async function loadTenantData () {
  try {
    await postTenants.insertTenant('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'http://idp.dmgt.com.mock.localhost:3002/.well-known/jwks.json')
    await postTenants.insertTenant('test-tenant2', 'http://anotheridp.anotherco.com.mock.localhost:3002/', 'http://anotheridp.anotherco.com.mock.localhost:3002/.well-known/jwks.json')
  } catch (error) {
    throw new Error('Tenant data failed to load ' + error.message)
  }
}

async function loadPersonaData () {
  try {
    await postPersonas.insertPersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e472b2d8a409e0e62026856', '')
    await postPersonas.insertPersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|test-persona2-REPLACE', '')
    await postPersonas.insertPersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|test-persona2-REPLACE', 'with_context')
    await postPersonas.insertPersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e5feabeb087080ddea78663', '')
    await postPersonas.insertPersona('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e62a48b2f42030d3688947e', '')
  } catch (error) {
    throw new Error('Persona data failed to load ' + error.message)
  }
}

async function loadTenantClientData () {
  try {
    await postTenantClients.insertTenantClient('test-tenant2', 'http://anotheridp.anotherco.com.mock.localhost:3002/', 'test-client1')
    await postTenantClients.insertTenantClient('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'the-usher')
    await postTenantClients.insertTenantClient('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'site-iq')
    await postTenantClients.insertTenantClient('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'exposure-iq')
  } catch (error) {
    throw new Error('Tenant Client data failed to load ' + error.message)
  }
}

async function loadRolePermissionData () {
  try {
    await postRolePermissions.insertRolePermissionByClientId('test-client1', 'test-client1:test-role1', 'test-permission1')
    await postRolePermissions.insertRolePermissionByClientId('test-client1', 'test-client1:test-role1', 'test-permission2')
    await postRolePermissions.insertRolePermissionByClientId('test-client1', 'test-client1:test-role2', 'test-permission3')
    await postRolePermissions.insertRolePermissionByClientId('test-client1', 'test-client1:test-role2', 'test-permission4')
    await postRolePermissions.insertRolePermissionByClientId('test-client1', 'test-client1:test-role3', 'test-permission5')
    await postRolePermissions.insertRolePermissionByClientId('test-client2', 'test-client2:test-role1', 'test-permission6')
    await postRolePermissions.insertRolePermissionByClientId('test-client2', 'test-client2:test-role2', 'test-permission7')
    await postRolePermissions.insertRolePermissionByClientId('test-client2', 'test-client2:test-role3', 'test-permission5')
    await postRolePermissions.insertRolePermissionByClientId('test-client2', 'test-client2:test-role3', 'test-permission7')
    await postRolePermissions.insertRolePermissionByClientId('test-client3', 'test-client3:test-role1', 'test-permission7')
  } catch (error) {
    throw new Error('Role Permission data failed to load ' + error.message)
  }
}

async function loadPersonaRoleData () {
  try {
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e472b2d8a409e0e62026856', '', 'test-client3', 'test-client3:test-role1')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e472b2d8a409e0e62026856', '', 'test-client2', 'test-client2:test-role1')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e472b2d8a409e0e62026856', '', 'test-client1', 'test-client1:test-role1')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e472b2d8a409e0e62026856', '', 'test-client1', 'test-client1:test-role2')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e472b2d8a409e0e62026856', '', 'test-client2', 'test-client1:test-role2')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|test-persona2-REPLACE', '', 'test-client2', 'test-client2:test-role3')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|test-persona2-REPLACE', '', 'test-client2', 'test-client2:test-role1')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|test-persona2-REPLACE', '', 'test-client1', 'test-client1:test-role3')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|test-persona2-REPLACE', '', 'test-client1', 'test-client1:test-role1')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e5feabeb087080ddea78663', '', 'the-usher', 'the-usher:usher-admin')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e62a48b2f42030d3688947e', '', 'site-iq', 'site-iq:client-admin')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|5e62a48b2f42030d3688947e', '', 'exposure-iq', 'exposure-iq:client-admin')
    await postPersonaRoles.insertPersonaRole('test-tenant1', 'http://idp.dmgt.com.mock.localhost:3002/', 'mockauth0|test-persona2-REPLACE', 'with_context', 'test-client3', 'test-client3:test-role1')
  } catch (error) {
    throw new Error('Persona Role data failed to load ' + error.message)
  }
}

async function loadPersonaPermissionData () {
  try {
    await postPersonaPermissions.insertPersonaPermissionByClientId('test-client1', 'mockauth0|5e472b2d8a409e0e62026856', 'test-permission8')
  } catch (error) {
    throw new Error('Persona Permission data failed to load ' + error.message)
  }
}
