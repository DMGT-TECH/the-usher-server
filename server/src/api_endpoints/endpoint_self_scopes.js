const createError = require('http-errors')
const viewSelectRelationships = require('database/layer/view-select-relationships')
const DataFrame = require('dataframe-js').DataFrame

async function listSelfScopes (req, res, next) {
  const subClaim = req.user.sub
  if (!subClaim) {
    return next(createError(403, 'Forbidden: Borne token not accepted: missing sub claim (no subscriber is identified).'))
  }

  const scopeRows = await viewSelectRelationships.selectSelfScope(subClaim, req.header('user_context'), req.header('client_id'))
  const scope = getScope(scopeRows)
  const df = await new DataFrame(scope)

  let result

  if (req.header('payload_format') === 'collection') {
    result = df.toCollection()
  } else if (req.header('payload_format') === 'array') {
    result = df.toArray()
  } else if (req.header('payload_format') === 'hierarchy') {
    result = scope
  } else {
    result = df.toDict()
  }

  function getScope (inDbResults) {
    const rSet = new Set()
    inDbResults.forEach(function (row) { rSet.add(row.role) })
    const rArray = Array.from(rSet)
    const rpArray = []
    let pElement
    rArray.forEach(function (r) {
      pElement = getP(r)
      rpArray.push(pElement)
    })
    return rpArray

    function getP (inRole) {
      const pSet = new Set()
      inDbResults.forEach(function (p) {
        if (p.role === inRole) {
          pSet.add(p.permission)
        }
      })
      const perms = { role: inRole, permission: Array.from(pSet) }
      return perms
    }
  }

  res.status(200).send(result)
}

module.exports = { listSelfScopes }
