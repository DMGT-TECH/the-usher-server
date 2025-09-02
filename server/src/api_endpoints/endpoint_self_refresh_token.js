const createError = require('http-errors')
const jwtDecoder = require('jsonwebtoken')
const dbSessions = require('database/layer/admin-session')
const dbSelect = require('database/layer/view-select-relationships')
const tokenUtils = require('../utils/token-utils')
const env = require('../../server-env')

async function issueSelfRefreshToken(req, res, next) {
  const refreshToken = req.query.refresh_token
  const clientId = req.query.client_id

  // Check if the session exists and has not expired based on server configuration for session lifetime.
  const session = await dbSessions.getSessionByEventId(refreshToken)
  if (!session) {
    return next(createError(404, 'Not found: No session was found for refresh token.'))
  }

  // If session is expired, delete it from the sessions table and deny the user a JWT.
  const sessionLifetimeExpiry = tokenUtils.calculateSessionLifetimeExpiry(session.idp_expirationtime)
  if (sessionLifetimeExpiry <= 0) {
    await dbSessions.deleteSessionByPersonaKey(session.personakey)
    return next(createError(403, 'Forbidden: Refresh token has expired. Unable to issue new JWT access token.'))
  }

  // This ensures The Usher access token does not extend past the User's idp token's exp time
  const accessTokenDurationSeconds = Math.min(env.TOKEN_LIFETIME_SECONDS, sessionLifetimeExpiry)

  const decodedSessionIdpToken = jwtDecoder.decode(session.idp_token)
  const subClaim = decodedSessionIdpToken.sub
  const rolesAndPermissionsRows = await dbSelect.selectTenantPersonaClientRolePermissions(subClaim, req.header('user_context'), clientId)
  const personaPermissionsRows = await dbSelect.selectTenantPersonaPermissions(clientId, subClaim)
  const unionOfPermissions = [...new Set([...rolesAndPermissionsRows, ...personaPermissionsRows])]
  var permissionsSet = new Set()
  var rolesSet = new Set()
  unionOfPermissions.forEach(function (p) {
    rolesSet.add(p.rolename)
    permissionsSet.add(p.permissionname)
  })

  const signedAccessToken = await tokenUtils.createSignedAccessToken(
    subClaim,
    clientId,
    Array.from(rolesSet).join(' '),
    Array.from(permissionsSet).join(' '),
    accessTokenDurationSeconds
  )

  // https://tools.ietf.org/html/rfc6749#section-5.1
  res.append('Cache-Control', 'no-store')
  res.append('Pragma', 'no-cache')

  res.status(200).send({
    token_type: 'Bearer',
    access_token: signedAccessToken,
    refresh_token: refreshToken,
    expires_in: accessTokenDurationSeconds
  })
}

module.exports = {
  issueSelfRefreshToken
}
