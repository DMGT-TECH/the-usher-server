const moment = require('moment')
const jwt = require('jsonwebtoken')
const keystore = require('database/layer/db-keys')
const dbSelect = require('database/layer/view-select-relationships')
const isNullOrWhiteSpace = require('./lang-utils').isNullOrWhiteSpace
const env = require('../../server-env')

/**
 * Calculate the access token expiry (exp) based on the
 * server config for TOKEN_LIFETIME_SECONDS.
 *
 * @param {number} secondsUntilExpiry The duration (in seconds) the token should be valid for
 * @returns {number} expiry time as epoch milliseconds
 */
function calculateAccessTokenExpiryDate (secondsUntilExpiry) {
  const utcNow = moment.utc()
  const expiryTime = utcNow.add(secondsUntilExpiry, 'seconds')
  const exp = moment(expiryTime).unix()
  return exp
}

/**
 * Returns the subset of all of the roles and permissions
 * that cover the requested scope; if requestedScope is a
 * blank screen, all entitled roles and permissions are returns.
 *
 * @param {string} subClaim The `sub_claim` identifying the persona provided from the IdP token
 * @param {string} userContext (optional) User context indicated by the persona to subselect roles or permissions
 * @param {string} clientId The identifier for the client application the persona is authorizing
 * @param {string} requestedScope The space-separated list of permissions requested, or a blank string for all entitled permissions
 *
 */
async function obtainScopedRolesAndPermissions(subClaim, userContext, clientId, requestedScope) {
  try {
    const rolesAndPermissionsRows = await dbSelect.selectTenantPersonaClientRolePermissions(subClaim, userContext, clientId)
    const personaPermissionsRows = await dbSelect.selectTenantPersonaPermissions(clientId, subClaim)
    const unionOfPermissions = [...new Set([...rolesAndPermissionsRows, ...personaPermissionsRows])]
    var permissionsSet = new Set()
    unionOfPermissions.forEach(function (p) {
      permissionsSet.add(p.permissionname)
    })

    let entitledPermissions = Array.from(permissionsSet)
    let permissions

    let xAcceptedOAuthScopes
    if (isNullOrWhiteSpace(requestedScope)) {
      permissions = entitledPermissions
    } else {
      const requestedPermissions = requestedScope.split(' ')
      permissions = entitledPermissions.filter(p => requestedPermissions.includes(p))
      xAcceptedOAuthScopes = requestedPermissions.join(' ')
    }

    // Only return those roles for which permissions were requested and will be returned in the token
    let roles = Array.from(new Set(rolesAndPermissionsRows.filter(row => (permissions ?? []).includes(row.permissionname)).map(row => row.rolename)))
    return { roles, permissions, xAcceptedOAuthScopes }
  } catch (err) {
    throw {
      message: 'Failed to obtainScopedRolesAndPermissions',
      stack: err,
    }
  }
}



/**
 * Creates a signed access token.
 * @param {string} sub The sub claim for the User
 * @param {string} azp The authorized party, client id (name) requesting the token
 * @param {string} roles Space separated list of Roles
 * @param {string} scope Space separated list of Scopes
 * @param {number} secondsUntilExpiry The duration (in seconds) the token should be valid for
 */
async function createSignedAccessToken (sub, azp, roles, scope, secondsUntilExpiry) {
  const latestKeyPair = await keystore.selectLatestKey()

  const signedAccessToken = jwt.sign(
    {
      iss: env.SERVER_URL,
      sub: sub,
      azp: azp,
      roles: roles,
      scope: scope,
      exp: calculateAccessTokenExpiryDate(secondsUntilExpiry)
    },
    latestKeyPair.private_key,
    {
      algorithm: 'RS256',
      header: { kid: latestKeyPair.kid }
    }
  )

  return signedAccessToken
}

/**
 * Calculates the maximum possible remaining time (seconds) that new access tokens can possibly be valid for.
 * This is in effect the remaining time left that a refresh_token is valid for.
 *
 * @param {*} idpExpirationTimestamp The idp expiration timestamp
 * @returns {number} Number of seconds remaining in session for use in new access token
 *  **NOTE** This number can be negative if the idp token expiration timestamp has elapsed
 */
 function calculateSessionLifetimeExpiry (idpExpirationTimestamp) {
  const utcNow = moment.utc()

  const idpExpirationDateTime = moment.utc(idpExpirationTimestamp)

  const idpSecondsUntilExpiry = idpExpirationDateTime.diff(utcNow, 'seconds')
  if (env.SESSION_LIFETIME_SECONDS >= idpSecondsUntilExpiry) {
    return idpSecondsUntilExpiry
  } else {
    return env.SESSION_LIFETIME_SECONDS
  }
}

module.exports = {
  createSignedAccessToken,
  obtainScopedRolesAndPermissions,
  calculateSessionLifetimeExpiry
}
