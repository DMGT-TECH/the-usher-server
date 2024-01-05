const dbSelectRelationships = require('database/layer/view-select-relationships')
const dbSelectEntities = require('database/layer/view-select-entities')

const usherEntitledRoles = ['the-usher:usher-admin']
const tenantEntitledRoles = ['the-usher:tenant-admin']

module.exports = { getClients }

async function getClients (req, res) {
  const payload = req.user

  const tenantPersonaRowsClient = await dbSelectRelationships.selectTenantPersonaClientRoles(payload.sub, '', '*')
  const personaHasUsherAdmin = tenantPersonaRowsClient.map(x => x.rolename).some(role => usherEntitledRoles.includes(role))
  const personaHasTenantAdmin = tenantPersonaRowsClient.map(x => x.rolename).some(role => tenantEntitledRoles.includes(role))

  let dbResult = null
  if (personaHasUsherAdmin) {
    // If the persona has role "the-usher:usher-admin" then list all the clients managed on this server.
    dbResult = await dbSelectEntities.selectClients()
  } else if (personaHasTenantAdmin) {
    // If the persona has role "the-usher:tenant-admin" then list all the clients managed on this tenant.
    dbResult = await dbSelectRelationships.selectClientsByTenantPersonaRole(payload.sub, '', '*')
  } else {
    dbResult = await dbSelectRelationships.selectClientsByTenantPersonaRole(payload.sub, '', '%:client-admin')
  }
  const result = dbResult.map(row => ({ client_id: row.client_id, clientname: row.clientname }))

  res.status(200).send(result)
}
