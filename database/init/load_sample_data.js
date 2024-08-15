// Require entities
const postTenants = require('../layer/admin-tenant')
const postClients = require('../layer/admin-client')
const postRoles = require('../layer/admin-role')
const postPermissions = require('../layer/admin-permission')
const postPersonas = require('../layer/admin-persona')
// Require relationships
const postPersonaRoles = require('../layer/admin-personarole')
const postRolePermissions = require('../layer/admin-rolepermissions')
const postPersonaPermissions = require('../layer/admin-personapermission')

module.exports = { loadSampleData }

async function loadSampleData () {
  try {
    await loadTenantData()
    await loadPersonaData()
    await loadClientData()
    await loadRoleData()
    await loadPermissionData()
    await loadRolePermissionData()
    await loadPersonaRoleData()
    await loadPersonaPermissionData()
    console.log('The sample data is loaded and ready to use')
  } catch (error) {
    console.log(error.message)
    console.log('The sample data should be fixed an reloaded')
  }
}

async function loadClientData () {
  try {
    await postClients.insertClient('DMGT OOCTO', 'the-usher', 'The Usher', 'This Resource Authorization Server', 'isurnviuvapivruybas')
    await postClients.insertClient('DMGT OOCTO', 'site-iq', 'Site IQ', 'Site IQ Product', 'hsvkjhtksdikfuosiuy')
    await postClients.insertClient('DMGT OOCTO', 'exposure-iq', 'Exposure IQ', 'Exposure IQ Product', 'sdjkhfbvsnsdfas')
    await postClients.insertClient('DMGT OOCTO', 'tessl', 'Tessl', '', 'oouyoylljkjlkjohkkouu')
    return null
  } catch (error) {
    throw new Error('Client data failed to load ' + error.message)
  }
}

async function loadRoleData () {
  try {
    await postRoles.insertRoleByClientId('the-usher', 'the-usher:usher-admin', 'admin for the usher')
    await postRoles.insertRoleByClientId('the-usher', 'the-usher:tenant-admin', 'admin for the tenant')
    await postRoles.insertRoleByClientId('site-iq', 'site-iq:user', 'can use Site IQ fully')
    await postRoles.insertRoleByClientId('site-iq', 'site-iq:modeller', 'can model in Site IQ')
    await postRoles.insertRoleByClientId('site-iq', 'site-iq:limited', 'can read data in Site IQ')
    await postRoles.insertRoleByClientId('exposure-iq', 'exposure-iq:user', 'can use Exposure IQ fully')
    await postRoles.insertRoleByClientId('exposure-iq', 'exposure-iq:modeller', 'can model in Exposure IQ')
    await postRoles.insertRoleByClientId('exposure-iq', 'exposure-iq:limited', 'can read data in Exposure IQ')
    await postRoles.insertRoleByClientId('site-iq', 'site-iq:client-admin', 'can administer Site IQ')
    await postRoles.insertRoleByClientId('exposure-iq', 'exposure-iq:client-admin', 'can administer Exposure IQ')
    await postRoles.insertRoleByClientId('tessl', 'landmark:tessl:consumer', 'public user of tessl')
    await postRoles.insertRoleByClientId('tessl', 'landmark:tessl:conveyancer', 'business user of tessl')
    return null
  } catch (error) {
    throw new Error('Role data failed to load ' + error.message)
  }
}

async function loadPermissionData () {
  try {
    await postPermissions.insertPermissionByClientId('the-usher', 'client:admin', 'admin for the client')
    await postPermissions.insertPermissionByClientId('site-iq', 'app:read', 'can read data')
    await postPermissions.insertPermissionByClientId('site-iq', 'app:write', 'can write new data')
    await postPermissions.insertPermissionByClientId('site-iq', 'app:update', 'can amend existing data')
    await postPermissions.insertPermissionByClientId('site-iq', 'app:delete', 'can delete data')
    await postPermissions.insertPermissionByClientId('site-iq', 'model:create', 'create a new model')
    await postPermissions.insertPermissionByClientId('site-iq', 'model:run', 'run an existing model')
    await postPermissions.insertPermissionByClientId('exposure-iq', 'app:read', 'can read data')
    await postPermissions.insertPermissionByClientId('exposure-iq', 'app:write', 'can write new data')
    await postPermissions.insertPermissionByClientId('exposure-iq', 'app:update', 'can amend existing data')
    await postPermissions.insertPermissionByClientId('exposure-iq', 'app:delete', 'can delete data')
    await postPermissions.insertPermissionByClientId('exposure-iq', 'model:create', 'create a new model')
    await postPermissions.insertPermissionByClientId('exposure-iq', 'model:run', 'run an existing model')
    await postPermissions.insertPermissionByClientId('tessl', 'landmark:document:read', 'can read document')
    await postPermissions.insertPermissionByClientId('tessl', 'landmark:document:create', 'can create document')
    await postPermissions.insertPermissionByClientId('tessl', 'landmark:document:share:create', 'can share document')
    await postPermissions.insertPermissionByClientId('tessl', 'landmark:transaction:read', 'can read transaction')
    await postPermissions.insertPermissionByClientId('tessl', 'landmark:transaction:create', 'can create transaction')
  } catch (error) {
    throw new Error('Permission data failed to load ' + error.message)
  }
}

async function loadTenantData () {
  try {
    await postTenants.insertTenant('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'https://dmgt-prod.auth0.com/.well-known/jwks.json')
  } catch (error) {
    throw new Error('Tenant data failed to load ' + error.message)
  }
}

async function loadPersonaData () {
  try {
    await postPersonas.insertPersona('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'patryk@dmgt.com', '')
    await postPersonas.insertPersona('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'andy@dmgt.com', '')
    await postPersonas.insertPersona('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'arkadiy@dmgt.com', '')
    await postPersonas.insertPersona('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'rob@dmgt.com', '')
    await postPersonas.insertPersona('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'arvin@dmgt.com', '')
    await postPersonas.insertPersona('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'sindhu@dmgt.com', '')
    await postPersonas.insertPersona('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'anya@dmgt.com', '')
  } catch (error) {
    throw new Error('Persona data failed to load ' + error.message)
  }
}

async function loadRolePermissionData () {
  try {
    await postRolePermissions.insertRolePermissionByClientId('the-usher', 'the-usher:usher-admin', 'client:admin')
    await postRolePermissions.insertRolePermissionByClientId('site-iq', 'site-iq:user', 'app:read')
    await postRolePermissions.insertRolePermissionByClientId('site-iq', 'site-iq:user', 'app:write')
    await postRolePermissions.insertRolePermissionByClientId('site-iq', 'site-iq:user', 'app:update')
    await postRolePermissions.insertRolePermissionByClientId('site-iq', 'site-iq:user', 'app:delete')
    await postRolePermissions.insertRolePermissionByClientId('site-iq', 'site-iq:modeller', 'model:create')
    await postRolePermissions.insertRolePermissionByClientId('site-iq', 'site-iq:modeller', 'model:run')
    await postRolePermissions.insertRolePermissionByClientId('site-iq', 'site-iq:limited', 'app:read')
    await postRolePermissions.insertRolePermissionByClientId('exposure-iq', 'exposure-iq:user', 'app:read')
    await postRolePermissions.insertRolePermissionByClientId('exposure-iq', 'exposure-iq:user', 'app:write')
    await postRolePermissions.insertRolePermissionByClientId('exposure-iq', 'exposure-iq:user', 'app:update')
    await postRolePermissions.insertRolePermissionByClientId('exposure-iq', 'exposure-iq:user', 'app:delete')
    await postRolePermissions.insertRolePermissionByClientId('exposure-iq', 'exposure-iq:modeller', 'model:create')
    await postRolePermissions.insertRolePermissionByClientId('exposure-iq', 'exposure-iq:modeller', 'model:run')
    await postRolePermissions.insertRolePermissionByClientId('exposure-iq', 'exposure-iq:limited', 'app:read')
    await postRolePermissions.insertRolePermissionByClientId('tessl', 'landmark:tessl:consumer', 'landmark:document:read')
    await postRolePermissions.insertRolePermissionByClientId('tessl', 'landmark:tessl:consumer', 'landmark:document:create')
    await postRolePermissions.insertRolePermissionByClientId('tessl', 'landmark:tessl:consumer', 'landmark:transaction:read')
    await postRolePermissions.insertRolePermissionByClientId('tessl', 'landmark:tessl:conveyancer', 'landmark:document:read')
    await postRolePermissions.insertRolePermissionByClientId('tessl', 'landmark:tessl:conveyancer', 'landmark:document:create')
    await postRolePermissions.insertRolePermissionByClientId('tessl', 'landmark:tessl:conveyancer', 'landmark:transaction:read')
    await postRolePermissions.insertRolePermissionByClientId('tessl', 'landmark:tessl:conveyancer', 'landmark:transaction:create')
  } catch (error) {
    throw new Error('Role Permission data failed to load ' + error.message)
  }
}

async function loadPersonaRoleData () {
  try {
    await postPersonaRoles.insertPersonaRole('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'patryk@dmgt.com', '', 'exposure-iq', 'exposure-iq:modeller')
    await postPersonaRoles.insertPersonaRole('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'patryk@dmgt.com', '', 'exposure-iq', 'exposure-iq:user')
    await postPersonaRoles.insertPersonaRole('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'patryk@dmgt.com', '', 'site-iq', 'site-iq:modeller')
    await postPersonaRoles.insertPersonaRole('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'patryk@dmgt.com', '', 'site-iq', 'site-iq:user')
    await postPersonaRoles.insertPersonaRole('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'patryk@dmgt.com', '', 'the-usher', 'the-usher:usher-admin')
    await postPersonaRoles.insertPersonaRole('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'andy@dmgt.com', '', 'site-iq', 'site-iq:user')
    await postPersonaRoles.insertPersonaRole('DMGT OOCTO', 'https://dmgt-prod.auth0.com/', 'andy@dmgt.com', '', 'the-usher', 'the-usher:usher-admin')
  } catch (error) {
    throw new Error('Persona Role data failed to load ' + error.message)
  }
}

async function loadPersonaPermissionData () {
  try {
    await postPersonaPermissions.insertPersonaPermissionByClientId('DMGT OOCTO', 'patryk@dmgt.com', 'client:admin')
    await postPersonaPermissions.insertPersonaPermissionByClientId('DMGT OOCTO', 'patryk@dmgt.com', 'app:read')
    await postPersonaPermissions.insertPersonaPermissionByClientId('DMGT OOCTO', 'patryk@dmgt.com', 'app:write')
    await postPersonaPermissions.insertPersonaPermissionByClientId('DMGT OOCTO', 'patryk@dmgt.com', 'app:update')
    await postPersonaPermissions.insertPersonaPermissionByClientId('DMGT OOCTO', 'patryk@dmgt.com', 'app:delete')
    await postPersonaPermissions.insertPersonaPermissionByClientId('DMGT OOCTO', 'andy@dmgt.com', 'landmark:transaction:read')
    await postPersonaPermissions.insertPersonaPermissionByClientId('DMGT OOCTO', 'andy@dmgt.com', 'landmark:transaction:create')
  } catch (error) {
    throw new Error('Persona Permission data failed to load ' + error.message)
  }
}
