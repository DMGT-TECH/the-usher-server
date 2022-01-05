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
const dataClearUp = require('./delete_data')

generateScenario1Data()

async function generateScenario1Data () {
  try {
    await deleteAllData()
    await loadSampleDataScenario1()
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

async function loadSampleDataScenario1 () {
  try {
    await loadTenantData()
    await loadClientData()
    await loadRoleData()
    await loadPermissionData()
    await loadPersonaData()
    await loadTenantClientData()
    await loadRolePermissionData()
    await loadPersonaRoleData()

    await loadPersonaDataPhase2()
    await loadPersonaRoleDataPhase2()

    await loadClientDataPhase3()
    await loadRoleDataPhase3()
    await loadPersonaDataPhase3()
    await loadPersonaRoleDataPhase3()

    console.log('The Scenario 1 sample data is loaded and ready to use')
  } catch (error) {
    throw new Error('Scenario 1 sample data failed to load ' + error.message)
  }
}

// Initial configuration

async function loadTenantData () {
  try {
    await postTenants.insertTenant('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'http://auth.labs.dmgt.com.mock:3002/.well-known/jwks.json')
  } catch (error) {
    throw new Error('Tenant data failed to load ' + error.message)
  }
}

async function loadClientData () {
  try {
    await postClients.insertClient('xyz-tenant', 'the-usher', 'The Usher', 'This Resource Authorization Server', 'tvZ50HzITKwj7YmDc1Uoocktod1lo0Df')
  } catch (error) {
    // do not throw error
    console.log('the-usher client may already have been created')
  }
}

async function loadRoleData () {
  try {
    await postRoles.insertRoleByClientId('the-usher', 'the-usher:usher-admin', 'The Usher Administrator role')
    await postRoles.insertRoleByClientId('the-usher', 'the-usher:tenant-admin', 'Can administer tenants on the The Usher')
    await postRoles.insertRoleByClientId('the-usher', 'the-usher:client-admin', 'Can administer clients on the The Usher')
  } catch (error) {
    throw new Error('Role data failed to load ' + error.message)
  }
}

async function loadPermissionData () {
  try {
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:manage-tenants', 'manage TENANTS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:manage-clients', 'manage CLIENTS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:manage-personas', 'adminster PERSONAS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:manage-groups', 'manage GROUPS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:manage-tenantadmin-roles', 'manage tenant-admin ROLES')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:manage-clientadmin-roles', 'manage client:admin ROLES')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:manage-roles', 'manage non-admin ROLES')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:manage-permissions', 'manage PERMISSIONS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:assign-tenantadmin', 'assign tenant-admin ROLES to PERSONAS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:assign-tenantclients', 'assign CLIENTS to TENANTS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:assign-tenantpersonas', 'assign PERSONAS to TENANTS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:assign-clientadmin', 'assign client:admin ROLES to PERSONAS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:assign-clientroles', 'assign non-admin ROLES to CLIENTS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:assign-personaroles', 'assign non-admin ROLES to PERSONAS')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:assign-tenantadmin-rolepermissions', 'assign PERMISSIONS to tenant-admin ROLES')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:assign-clientadmin-rolepermissions', 'assign PERMISSIONS to client:admin ROLES')
    await postPermissions.insertPermissionByClientId('the-usher', 'the-usher:assign-rolepermissions', 'assign PERMISSIONS to non-admin ROLES')
  } catch (error) {
    throw new Error('Permission data failed to load ' + error.message)
  }
}

async function loadPersonaData () {
  try {
    // bob@xyzltd.com > sub_claim: auth0|5e7933cb2a97390d05f95ab9
    await postPersonas.insertPersona('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'mockauth0|5e7933cb2a97390d05f95ab9', '')
  } catch (error) {
    throw new Error('Persona data failed to load ' + error.message)
  }
}

async function loadTenantClientData () {
  try {
    await postTenantClients.insertTenantClient('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'the-usher')
  } catch (error) {
    throw new Error('Tenant Client data failed to load ' + error.message)
  }
}

async function loadRolePermissionData () {
  try {
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:manage-tenants')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:manage-clients')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:manage-personas')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:manage-groups')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:manage-tenantadmin-roles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:manage-clientadmin-roles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:manage-roles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:manage-permissions')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:assign-tenantadmin')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:assign-tenantclients')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:assign-tenantpersonas')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:assign-clientadmin')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:assign-clientroles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:assign-personaroles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:assign-tenantadmin-rolepermissions')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:assign-clientadmin-rolepermissions')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'the-usher:assign-rolepermissions')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:manage-clients')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:manage-personas')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:manage-groups')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:manage-clientadmin-roles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:manage-roles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:manage-permissions')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:assign-tenantclients')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:assign-tenantpersonas')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:assign-clientadmin')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:assign-clientroles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:assign-personaroles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:assign-clientadmin-rolepermissions')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:tenant-admin', 'the-usher:assign-rolepermissions')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:client-admin', 'the-usher:manage-roles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:client-admin', 'the-usher:manage-permissions')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:client-admin', 'the-usher:assign-clientroles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:client-admin', 'the-usher:assign-personaroles')
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:client-admin', 'the-usher:assign-rolepermissions')
  } catch (error) {
    throw new Error('Role Permission data failed to load ' + error.message)
  }
}

async function loadPersonaRoleData () {
  try {
    await postPersonaRoles.insertPersonaRole('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'mockauth0|5e7933cb2a97390d05f95ab9', '', 'the-usher', 'the-usher:usher-admin')
  } catch (error) {
    throw new Error('Persona Role data failed to load ' + error.message)
  }
}

// PHASE 2 - Bob delgates management of the tenant to Harper

async function loadPersonaDataPhase2 () {
  try {
    // harper@xyzltd.com > sub_claim: auth0|5e793f6a90ddf30d0ecabcb8
    await postPersonas.insertPersona('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'mockauth0|5e793f6a90ddf30d0ecabcb8', '')
  } catch (error) {
    throw new Error('Persona data failed to load - phase 2 ' + error.message)
  }
}

async function loadPersonaRoleDataPhase2 () {
  try {
    await postPersonaRoles.insertPersonaRole('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'mockauth0|5e793f6a90ddf30d0ecabcb8', '', 'the-usher', 'the-usher:tenant-admin')
  } catch (error) {
    throw new Error('Persona Role data failed to load - phase 2 ' + error.message)
  }
}

// PHASE 3 - Harper creates clients and delegates management of roles and permissions to Chelsea

async function loadClientDataPhase3 () {
  try {
    await postClients.insertClient('xyz-tenant', 'balloon-battle', 'Balloon Battle', 'The Balloon Battle product', 'IXZzF33ZcT7M2T40SRCIKBaTCYbxF4AW')
    await postClients.insertClient('xyz-tenant', 'cheese-challenge', 'Cheese Challenge', 'The Cheese Challenge product', 't2y2XORAo4yWfAZEwWmcpnDnKLurVQce')
    return null
  } catch (error) {
    throw new Error('Client data failed to load phase 3 ' + error.message)
  }
}

async function loadRoleDataPhase3 () {
  try {
    await postRoles.insertRoleByClientId('balloon-battle', 'balloon-battle:client-admin', 'Balloon Battle Administrator role')
    await postRoles.insertRoleByClientId('cheese-challenge', 'cheese-challenge:client-admin', 'Cheese Challenge Administrator Role')
  } catch (error) {
    throw new Error('Role data failed to load ' + error.message)
  }
}

async function loadPersonaDataPhase3 () {
  try {
    // chelsea@xyzltd.com > sub_claim: auth0|5e793fab5d5c730cf7bbf713
    await postPersonas.insertPersona('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'mockauth0|5e793fab5d5c730cf7bbf713', '')
  } catch (error) {
    throw new Error('Persona data failed to load phase 3 ' + error.message)
  }
}

async function loadPersonaRoleDataPhase3 () {
  try {
    await postPersonaRoles.insertPersonaRole('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'mockauth0|5e793fab5d5c730cf7bbf713', '', 'the-usher', 'the-usher:client-admin')
    await postPersonaRoles.insertPersonaRole('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'mockauth0|5e793fab5d5c730cf7bbf713', '', 'balloon-battle', 'balloon-battle:client-admin')
    await postPersonaRoles.insertPersonaRole('xyz-tenant', 'http://auth.labs.dmgt.com.mock:3002/', 'mockauth0|5e793fab5d5c730cf7bbf713', '', 'cheese-challenge', 'cheese-challenge:client-admin')
  } catch (error) {
    throw new Error('Persona Role data failed to load phase 3 ' + error.message)
  }
}
