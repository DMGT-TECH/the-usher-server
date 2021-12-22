const createError = require('http-errors')
const dbSelectRelationships = require('database/layer/view-select-relationships')
const dbSelectEntities = require('database/layer/view-select-entities')
const dbAdminClient = require('database/layer/admin-client')

const entitledRoles = ['the-usher:usher-admin', 'the-usher:tenant-admin']
const usherEntitledRoles = ['the-usher:usher-admin']
const tenantEntitledRoles = ['the-usher:tenant-admin']

module.exports = { getClients, postClients, deleteClients }

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

async function postClients (req, res, next) {
  const payload = req.user

  // Only the-usher:usher-admin and the-usher:tenant-admin can manage clients
  const tenantPersonaRowsClient = await dbSelectRelationships.selectTenantPersonaClientRoles(payload.sub, '', 'the-usher')
  const personaHasAdmin = tenantPersonaRowsClient.map(x => x.rolename).some(role => entitledRoles.includes(role))

  if (personaHasAdmin) {
    try {
      const result = await dbAdminClient.insertClient(req.body.client_id, req.body.name, req.body.description, req.body.secret)
      res.status(201).send({ code: 201, message: result })
    } catch (error) {
      return next(createError(400, error.message))
    }
  }
}

async function deleteClients (req, res, next) {
  const payload = req.user

  // Only the-usher:usher-admin and the-usher:tenant-admin can manage clients
  const tenantPersonaRowsClient = await dbSelectRelationships.selectTenantPersonaClientRoles(payload.sub, '', 'the-usher')
  const personaHasAdmin = tenantPersonaRowsClient.map(x => x.rolename).some(role => entitledRoles.includes(role))

  if (personaHasAdmin) {
    try {
      const result = await dbAdminClient.deleteClientByClientId(req.params.client_id)
      res.status(201).send({ code: 201, message: result })
    } catch (error) {
      return next(createError(400, error.message))
    }
  }
}
