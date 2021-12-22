const createError = require('http-errors')
const dbSelect = require('database/layer/view-select-relationships')

async function getSelfClients (req, res, next) {
  const subClaim = req.user.sub
  if (!subClaim) {
    return next(createError(403, 'Forbidden: Borne token not accepted: missing sub claim (no subscriber is identified).'))
  }

  const clientsRows = await dbSelect.selectTenantPersonaClients(subClaim, req.header('user_context'), req.header('client_id'))
  const clientsArray = []
  clientsRows.forEach(function (p) {
    clientsArray.push({ client_id: p.client_id, clientname: p.clientname })
  })
  res.status(200).send(clientsArray)
}

module.exports = {
  getSelfClients
}
