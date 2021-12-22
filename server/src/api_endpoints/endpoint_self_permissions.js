const createError = require('http-errors')
const viewSelectRelationships = require('database/layer/view-select-relationships')
const DataFrame = require('dataframe-js').DataFrame

async function getSelfPermissions (req, res, next) {
  const subClaim = req.user.sub
  if (!subClaim) {
    return next(createError(403, 'Forbidden: Borne token not accepted: missing sub claim (no subscriber is identified).'))
  }

  const permissionsRows = await viewSelectRelationships.selectSelfPermissions(subClaim, req.header('user_context'), req.header('client_id'))
  const df = await new DataFrame(permissionsRows)

  let result
  if (req.header('payload_format') === 'collection') {
    result = df.toCollection()
  } else if (req.header('payload_format') === 'array') {
    result = df.toArray()
  } else {
    result = df.toDict()
  }
  res.status(200).send(result)
}

module.exports = { getSelfPermissions }
