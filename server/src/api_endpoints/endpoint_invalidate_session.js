const createError = require('http-errors')
const dbSessions = require('database/layer/admin-session')
const isNullOrWhiteSpace = require('../utils/lang-utils').isNullOrWhiteSpace

async function invalidateSession (req, res, next) {
  const sub = req.query.sub
  if (isNullOrWhiteSpace(sub)) {
    return next(createError(400, 'Bad request: Query parameter "sub" must have a value.'))
  }
  const iss = req.query.iss
  if (isNullOrWhiteSpace(iss)) {
    return next(createError(400, 'Bad request: Query parameter "iss" must have a value.'))
  }

  // Implementation supports this query param not being submitted, no need to check if null/undefined
  const ucx = req.query.ucx

  // check the iss in the token matches iss in delete body
  if (req.user.iss !== iss) {
    return next(createError(403, 'Forbidden: Cannot invalidate session for a different issuer.'))
  }

  try {
    await dbSessions.deleteSessionBySubIss(sub, ucx, iss)
  } catch (err) {
    return next(createError(404, err))
  }

  res.status(200).send({
    code: 200,
    message: 'Successfully invalidated session'
  })
}

module.exports = {
  invalidateSession
}
