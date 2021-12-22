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
const dataClearUp = require('./delete_data')

generateSecurityTestData()

async function generateSecurityTestData () {
  try {
    await deleteAllData()
    await loadSampleData()
  } catch (error) {
    console.log(error.message)
  }
}

async function deleteAllData () {
  try {
    const clearUp = await dataClearUp.deleteAllData()
    console.log(clearUp)
  } catch (error) {
    throw new Error(error.message)
  }
}

async function loadSampleData () {
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

// Initial configuration

async function loadTenantData () {
  try {
    await postTenants.insertTenant('test_tenant1', 'https://test_tenant1.com/', 'https://test_tenant1.com/.well-known/jwks.json')
  } catch (error) {
    throw new Error('Tenant data failed to load ' + error.message)
  }
}

async function loadClientData () {
  try {
    await postClients.insertClient('appA', 'Client Application A', 'Client Application A', 'aaaaaaaaaaaaaaaaaaaa')
    await postClients.insertClient('appB', 'Client Application B', 'Client Application B', 'bbbbbbbbbbbbbbbbbbbb')
    await postClients.insertClient('appC', 'Client Application C', 'Client Application C', 'cccccccccccccccccccc')
    await postClients.insertClient('appD', 'Client Application D', 'Client Application D', 'dddddddddddddddddddd')
  } catch (error) {
    throw new Error('Client data failed to load ' + error.message)
  }
}

async function loadRoleData () {
  try {
    await postRoles.insertRoleByClientId('appA', 'appA:admin', 'Test Admin role')
    await postRoles.insertRoleByClientId('appA', 'appA:user', 'Test User role')
    await postRoles.insertRoleByClientId('appB', 'appB:admin', 'Test Admin role')
    await postRoles.insertRoleByClientId('appB', 'appB:user', 'Test User role')
    await postRoles.insertRoleByClientId('appC', 'appC:admin', 'Test Admin role')
    await postRoles.insertRoleByClientId('appC', 'appC:user', 'Test User role')
    await postRoles.insertRoleByClientId('appD', 'appD:admin', 'Test Admin role')
    await postRoles.insertRoleByClientId('appD', 'appD:user', 'Test User role')
  } catch (error) {
    throw new Error('Role data failed to load ' + error.message)
  }
}

async function loadPermissionData () {
  try {
    await postPermissions.insertPermissionByClientId('appA', 'ent:admin', 'administer entitlements')
    await postPermissions.insertPermissionByClientId('appA', 'app:admin', 'administer app')
    await postPermissions.insertPermissionByClientId('appA', 'doc:add', 'add documents')
    await postPermissions.insertPermissionByClientId('appA', 'doc:view', 'view documents')
    await postPermissions.insertPermissionByClientId('appA', 'doc:amend', 'amend documents')
    await postPermissions.insertPermissionByClientId('appA', 'doc:delete', 'delete documents')
    await postPermissions.insertPermissionByClientId('appB', 'ent:admin', 'administer entitlements')
    await postPermissions.insertPermissionByClientId('appB', 'app:admin', 'administer app')
    await postPermissions.insertPermissionByClientId('appB', 'doc:add', 'add documents')
    await postPermissions.insertPermissionByClientId('appB', 'doc:view', 'view documents')
    await postPermissions.insertPermissionByClientId('appB', 'doc:amend', 'amend documents')
    await postPermissions.insertPermissionByClientId('appB', 'doc:delete', 'delete documents')
    await postPermissions.insertPermissionByClientId('appC', 'ent:admin', 'administer entitlements')
    await postPermissions.insertPermissionByClientId('appC', 'app:admin', 'administer app')
    await postPermissions.insertPermissionByClientId('appC', 'doc:add', 'add documents')
    await postPermissions.insertPermissionByClientId('appC', 'doc:view', 'view documents')
    await postPermissions.insertPermissionByClientId('appC', 'doc:amend', 'amend documents')
    await postPermissions.insertPermissionByClientId('appC', 'doc:delete', 'delete documents')
    await postPermissions.insertPermissionByClientId('appD', 'ent:admin', 'administer entitlements')
    await postPermissions.insertPermissionByClientId('appD', 'app:admin', 'administer app')
    await postPermissions.insertPermissionByClientId('appD', 'doc:add', 'add documents')
    await postPermissions.insertPermissionByClientId('appD', 'doc:view', 'view documents')
    await postPermissions.insertPermissionByClientId('appD', 'doc:amend', 'amend documents')
    await postPermissions.insertPermissionByClientId('appD', 'doc:delete', 'delete documents')
  } catch (error) {
    throw new Error('Permission data failed to load ' + error.message)
  }
}

async function loadPersonaData () {
  try {
    // test-admin1 > sub_claim: 'auth0|5e5feabeb087080ddea78663', user_context: ''
    // test-user1  > sub_claim: 'auth0|5e472b2d8a409e0e62026856', user_context: ''
    // test-user2  > sub_claim: 'auth0|5ea867cbe84c0a0cb220ee3b', user_context: ''
    await postPersonas.insertPersona('test_tenant1', 'https://test_tenant1.com/', 'auth0|5e5feabeb087080ddea78663', '')
    await postPersonas.insertPersona('test_tenant1', 'https://test_tenant1.com/', 'auth0|5e472b2d8a409e0e62026856', '')
    await postPersonas.insertPersona('test_tenant1', 'https://test_tenant1.com/', 'auth0|5ea867cbe84c0a0cb220ee3b', '')
  } catch (error) {
    throw new Error('Persona data failed to load ' + error.message)
  }
}

async function loadTenantClientData () {
  try {
    await postTenantClients.insertTenantClient('test_tenant1', 'https://test_tenant1.com/', 'appA')
    await postTenantClients.insertTenantClient('test_tenant1', 'https://test_tenant1.com/', 'appB')
    await postTenantClients.insertTenantClient('test_tenant1', 'https://test_tenant1.com/', 'appC')
    await postTenantClients.insertTenantClient('test_tenant1', 'https://test_tenant1.com/', 'appD')
  } catch (error) {
    throw new Error('Tenant Client data failed to load ' + error.message)
  }
}

async function loadRolePermissionData () {
  try {
    await postRolePermissions.insertRolePermissionByClientId('appA', 'appA:admin', 'ent:admin')
    await postRolePermissions.insertRolePermissionByClientId('appA', 'appA:admin', 'app:admin')
    await postRolePermissions.insertRolePermissionByClientId('appA', 'appA:admin', 'doc:add')
    await postRolePermissions.insertRolePermissionByClientId('appA', 'appA:admin', 'doc:view')
    await postRolePermissions.insertRolePermissionByClientId('appA', 'appA:admin', 'doc:amend')
    await postRolePermissions.insertRolePermissionByClientId('appA', 'appA:admin', 'doc:delete')
    await postRolePermissions.insertRolePermissionByClientId('appB', 'appB:admin', 'ent:admin')
    await postRolePermissions.insertRolePermissionByClientId('appB', 'appB:admin', 'app:admin')
    await postRolePermissions.insertRolePermissionByClientId('appB', 'appB:admin', 'doc:add')
    await postRolePermissions.insertRolePermissionByClientId('appB', 'appB:admin', 'doc:view')
    await postRolePermissions.insertRolePermissionByClientId('appB', 'appB:admin', 'doc:amend')
    await postRolePermissions.insertRolePermissionByClientId('appB', 'appB:admin', 'doc:delete')
    await postRolePermissions.insertRolePermissionByClientId('appC', 'appC:admin', 'ent:admin')
    await postRolePermissions.insertRolePermissionByClientId('appC', 'appC:admin', 'app:admin')
    await postRolePermissions.insertRolePermissionByClientId('appC', 'appC:admin', 'doc:add')
    await postRolePermissions.insertRolePermissionByClientId('appC', 'appC:admin', 'doc:view')
    await postRolePermissions.insertRolePermissionByClientId('appC', 'appC:admin', 'doc:amend')
    await postRolePermissions.insertRolePermissionByClientId('appC', 'appC:admin', 'doc:delete')
    await postRolePermissions.insertRolePermissionByClientId('appD', 'appD:admin', 'ent:admin')
    await postRolePermissions.insertRolePermissionByClientId('appD', 'appD:admin', 'app:admin')
    await postRolePermissions.insertRolePermissionByClientId('appD', 'appD:admin', 'doc:add')
    await postRolePermissions.insertRolePermissionByClientId('appD', 'appD:admin', 'doc:view')
    await postRolePermissions.insertRolePermissionByClientId('appD', 'appD:admin', 'doc:amend')
    await postRolePermissions.insertRolePermissionByClientId('appD', 'appD:admin', 'doc:delete')
    await postRolePermissions.insertRolePermissionByClientId('appA', 'appA:user', 'doc:add')
    await postRolePermissions.insertRolePermissionByClientId('appA', 'appA:user', 'doc:view')
    await postRolePermissions.insertRolePermissionByClientId('appA', 'appA:user', 'doc:amend')
    await postRolePermissions.insertRolePermissionByClientId('appB', 'appB:user', 'doc:add')
    await postRolePermissions.insertRolePermissionByClientId('appB', 'appB:user', 'doc:view')
    await postRolePermissions.insertRolePermissionByClientId('appB', 'appB:user', 'doc:amend')
    await postRolePermissions.insertRolePermissionByClientId('appC', 'appC:user', 'doc:add')
    await postRolePermissions.insertRolePermissionByClientId('appC', 'appC:user', 'doc:view')
    await postRolePermissions.insertRolePermissionByClientId('appC', 'appC:user', 'doc:amend')
    await postRolePermissions.insertRolePermissionByClientId('appD', 'appD:user', 'doc:add')
    await postRolePermissions.insertRolePermissionByClientId('appD', 'appD:user', 'doc:view')
    await postRolePermissions.insertRolePermissionByClientId('appD', 'appD:user', 'doc:amend')
  } catch (error) {
    throw new Error('Role Permission data failed to load ' + error.message)
  }
}

async function loadPersonaRoleData () {
  try {
    await postPersonaRoles.insertPersonaRole('test_tenant1', 'https://test_tenant1.com/', 'auth0|5e5feabeb087080ddea78663', '', 'appA', 'appA:admin')
    await postPersonaRoles.insertPersonaRole('test_tenant1', 'https://test_tenant1.com/', 'auth0|5e5feabeb087080ddea78663', '', 'appB', 'appB:admin')
    await postPersonaRoles.insertPersonaRole('test_tenant1', 'https://test_tenant1.com/', 'auth0|5e5feabeb087080ddea78663', '', 'appC', 'appC:admin')
    await postPersonaRoles.insertPersonaRole('test_tenant1', 'https://test_tenant1.com/', 'auth0|5e472b2d8a409e0e62026856', '', 'appA', 'appA:user')
    await postPersonaRoles.insertPersonaRole('test_tenant1', 'https://test_tenant1.com/', 'auth0|5e472b2d8a409e0e62026856', '', 'appB', 'appB:user')
    await postPersonaRoles.insertPersonaRole('test_tenant1', 'https://test_tenant1.com/', 'auth0|5ea867cbe84c0a0cb220ee3b', '', 'appA', 'appA:user')
    await postPersonaRoles.insertPersonaRole('test_tenant1', 'https://test_tenant1.com/', 'auth0|5ea867cbe84c0a0cb220ee3b', '', 'appC', 'appC:user')
  } catch (error) {
    throw new Error('Persona Role data failed to load ' + error.message)
  }
}

async function loadPersonaPermissionData () {
  try {
    await postPersonaPermissions.insertPersonaPermissionByClientId('appA', 'auth0|5e5feabeb087080ddea78663', 'ent:admin')
    await postPersonaPermissions.insertPersonaPermissionByClientId('appB', 'auth0|5e472b2d8a409e0e62026856', 'doc:add')
    await postPersonaPermissions.insertPersonaPermissionByClientId('appB', 'auth0|5e472b2d8a409e0e62026856', 'doc:view')
    await postPersonaPermissions.insertPersonaPermissionByClientId('appC', 'auth0|5e472b2d8a409e0e62026856', 'doc:add')
    await postPersonaPermissions.insertPersonaPermissionByClientId('appC', 'auth0|5e472b2d8a409e0e62026856', 'doc:view')
    await postPersonaPermissions.insertPersonaPermissionByClientId('appC', 'auth0|5e472b2d8a409e0e62026856', 'doc:amend')
    await postPersonaPermissions.insertPersonaPermissionByClientId('appC', 'auth0|5e472b2d8a409e0e62026856', 'doc:delete')
    await postPersonaPermissions.insertPersonaPermissionByClientId('appC', 'auth0|5ea867cbe84c0a0cb220ee3b', 'doc:view')
    await postPersonaPermissions.insertPersonaPermissionByClientId('appC', 'auth0|5ea867cbe84c0a0cb220ee3b', 'doc:add')
  } catch (error) {
    throw new Error('Persona Permission data failed to load ' + error.message)
  }
}
