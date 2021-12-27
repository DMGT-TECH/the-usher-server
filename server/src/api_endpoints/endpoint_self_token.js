const createError = require('http-errors')
const jwtDecoder = require('jsonwebtoken')
const moment = require('moment')
const dbSessions = require('database/layer/admin-session')
const tokenUtils = require('../utils/token-utils')
const env = require('../../server-env')

async function issueSelfToken (req, res, next) {
  const authHeader = req.header('Authorization')
  if (!authHeader) {
    return next(createError(403, 'Forbidden: A token issued by a registered identity provider must be provided in header parameter Authorization.'))
  }
  const idpToken = authHeader.replace('Bearer ', '')
  const decodedToken = jwtDecoder.decode(idpToken, { complete: true })
  const subClaim = decodedToken.payload.sub
  if (!subClaim) {
    return next(createError(403, 'Forbidden: Borne token not accepted: missing sub claim (no subscriber is identified).'))
  }

  let { roles, permissions, xAcceptedOAuthScopes } = await tokenUtils.obtainScopedRolesAndPermissions(subClaim, req.header('user_context'), req.header('client_id'), req.query.scope)
  if (xAcceptedOAuthScopes) {
    res.append('X-Accepted-OAuth-Scopes', xAcceptedOAuthScopes)
  }


  // calculate the duration of the new access token to be issued
  const utcNow = moment.utc()
  const decodedTokenExpirationDate = moment.utc(decodedToken.payload.exp * 1000)
  const idpSecondsUntilExpiry = decodedTokenExpirationDate.diff(utcNow, 'seconds')
  const accessTokenDurationSeconds = Math.min(env.TOKEN_LIFETIME_SECONDS, idpSecondsUntilExpiry)

  const eventId = await dbSessions.createOrUpdateSession({
    subClaim: decodedToken.payload.sub,
    userContext: req.header('user_context'),
    issClaim: env?.ISSUER_ALIASES?.[decodedToken.payload.iss] ?? decodedToken.payload.iss,
    scope: permissions.join(' '),
    encodedIdpToken: idpToken,
    idpExpirationTime: decodedTokenExpirationDate.toISOString()
  })

  const signedAccessToken = await tokenUtils.createSignedAccessToken(
    decodedToken.payload.sub,
    req.header('client_id'),
    roles.join(' '),
    permissions.join(' '),
    accessTokenDurationSeconds
  )

  res.append('X-OAuth-Scopes', permissions.join(' '))
  // https://tools.ietf.org/html/rfc6749#section-5.1
  res.append('Cache-Control', 'no-store')
  res.append('Pragma', 'no-cache')

  res.status(200).send({
    token_type: 'Bearer',
    access_token: signedAccessToken,
    refresh_token: eventId,
    expires_in: accessTokenDurationSeconds
  })
}

module.exports = {
  issueSelfToken
}
