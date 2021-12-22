const createError = require('http-errors')
const viewSelectRelationships = require('database/layer/view-select-relationships')

async function getSelfRoles (req, res, next) {
  const subClaim = req.user.sub
  if (!subClaim) {
    return next(createError(403, 'Forbidden: Borne token not accepted: missing sub claim (no subscriber is identified).'))
  }

  const rolesRows = await viewSelectRelationships.selectSelfRoles(subClaim, req.header('user_context'), req.header('client_id'))
  res.status(200).send({ data: rolesRows })
}

module.exports = { getSelfRoles }
