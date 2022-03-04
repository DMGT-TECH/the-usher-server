const jwtDecoder = require('jsonwebtoken')
const jwksRsa = require('jwks-rsa')
const viewSelectEntities = require('database/layer/view-select-entities')
const viewSelectRelationships = require('database/layer/view-select-relationships')
const jwksClients = {}
const createError = require('http-errors')
const env = require('../../server-env')

async function verifyAndDecodeToken (token) {
  if (!token) {
    throw createError(403, 'Forbidden: No IdP JWT provided.')
  }
  const decodedToken = jwtDecoder.decode(token.replace('Bearer ', ''), { complete: true })
  if (!decodedToken.payload.sub) {
    throw createError(404, 'Could not find sub in token.')
  }
  const issuerClaim = decodedToken.payload.iss // Use iss claim to look up appropriate JWKS.

  let whitelistedIssuers = []
  if (env.ISSUER_WHITELIST) {
    whitelistedIssuers = env.ISSUER_WHITELIST.split(',')
  } else {
    throw createError(403, 'Forbidden: issuer whitelist not configured (ISSUER_WHITELIST).')
  }
  const isWhitelistedIssuer = whitelistedIssuers.includes(issuerClaim)
  if (!isWhitelistedIssuer) {
    throw createError(403, `Forbidden: JWT provided by non-whitelisted issuer: ${issuerClaim}`)
  }

  const possiblyAliased = env?.ISSUER_ALIASES?.[issuerClaim] ?? issuerClaim
  const tenant = await viewSelectEntities.selectIssuerJWKS(possiblyAliased)

  if (tenant.length === 0) {
    throw createError(500, 'Internal Server Error: Could not determine IdP JWKS for IdP token issuer ' + issuerClaim + '. Tenant not registered?')
  }

  let audience = decodedToken.payload.aud
  if (!audience) {
    throw createError(403, 'Forbidden: JWT is missing an audience claim.')
  }

  if (Array.isArray(audience)) {
    audience = audience[0]
  }

  // Optional check to verify the *audience* claim
  if (env.THEUSHER_AUD_CLAIMS) {
    const whitelistedAudienceURLs = env.THEUSHER_AUD_CLAIMS.split(',')
    if (!whitelistedAudienceURLs.includes(audience)) {
      throw createError(403, `Forbidden: JWT contains an aud claim (${audience}) not meant for this application.`)
    }
  }

  const jwksUri = tenant[0].jwks_uri
  let client
  if (jwksClients[jwksUri]) {
    client = jwksClients[jwksUri]
  } else {
    client = jwksRsa({ rateLimit: true, jwksRequestsPerMinute: 10, jwksUri: jwksUri })
    jwksClients[jwksUri] = client
  }

  const signingKey = (await client.getSigningKey(decodedToken.header.kid)).getPublicKey()
  try {
    const decoded = jwtDecoder.verify(
      token.replace('Bearer ', ''),
      signingKey,
      {
        algorithms: ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'],
        ignoreNotBefore: false
      }
    )
    if (decoded) {
      return decodedToken.payload
    } else {
      throw createError(400, 'Unauthorized: Authorization is not valid, no payload.')
    }
  } catch (err) {
    throw createError(400, 'Could not verify token: ' + err + '\n')
  }
}

/**
 * This is a helper function to verify if the given user has access to the given role / client
 *
 * @param {string} subClaim
 * @param {string} userContext
 * @param {string} clientId Either a * to not filter or a client_id to restrict Role searched to given Client
 * @param {string} requiredRoleName Either a full role name or suffix to match, ie: client-admin
 * @returns {boolean} True if the user has access to at least one of the roles
 */
async function verifyRoleGroupAccess (subClaim, userContext, clientId, requiredRoleName) {
  const userRoles = await viewSelectRelationships.selectTenantPersonaClientRoles(subClaim, userContext, clientId)
  const roleAccess = userRoles.map(x => x.rolename)
    .some(x => {
      const roleParts = x.split(':')
      const roleSuffix = roleParts.length > 0 ? roleParts.pop() : ''
      return x === requiredRoleName || requiredRoleName === roleSuffix
    })
  // TODO Logic: Query DB to check if any groups in IdP token grant admin access. If yes, grant access.
  const idpGroupsAccess = false

  return roleAccess || idpGroupsAccess
}

/**
 * This function checks the JWT for validity for /self/ API endpoints.
 * In particular, it checks that the persona (sub) or claimed groups are
 * managed on this server for the tenant.
 */
async function verifyTokenForSelf (req, secDef, token, next) {
  try {
    const payload = await verifyAndDecodeToken(token) // If the token isn't verified an exception will be thrown
    let personaIsManagedOnThisServerForTenant = false
    let personaIsPartOfGroupBelongingToTenant = false
    const tenantPersonaRows = await viewSelectRelationships.selectTenantPersonaClients(payload.sub, req.header('user_context'), req.header('client_id'))
    if (tenantPersonaRows.length > 0) {
      personaIsManagedOnThisServerForTenant = true
    }
    if (payload.groups) {
      console.log('WARNING: Access to The Usher using IdP-managed groups not yet implemented.')
      // TODO Logic: Query DB to check if any groups in IdP token are mapped to the tenant. If yes, grant access.
      personaIsPartOfGroupBelongingToTenant = false
    }

    if (personaIsManagedOnThisServerForTenant || personaIsPartOfGroupBelongingToTenant) {
      // add decoded token payload to request object
      req.user = payload
      return next() // Proceed, allow access to the endpoint.
    } else {
      return next(createError(401, 'Unauthorized: Persona not managed for tenant and not member of groups mapped to tenant.'))
    }
  } catch (err) {
    return next(createError(401, `Unauthorized: Authorization is not valid. ${err}`))
  }
}

async function verifyTokenForAdmin (req, secDef, token, next) {
  try {
    const payload = await verifyAndDecodeToken(token)
    const roleName = 'the-usher:usher-admin'
    const clientId = req.header('client_id') ? req.header('client_id') : '*'

    const access = await verifyRoleGroupAccess(payload.sub, '', clientId, roleName)

    if (access) {
      // add decoded token payload to request object and proceed
      req.user = payload
      next()
    } else {
      return next(createError(401, 'Unauthorized: Persona does not have Admin on this client or the-usher ' +
                'and did not obtain Admin via group membership.'
      ))
    }
  } catch (err) {
    return next(createError(401, `Unauthorized: Authorization is not valid. ${err}`))
  }
}

async function verifyTokenForClientAdmin (req, secDef, token, next) {
  try {
    const payload = await verifyAndDecodeToken(token)
    const clientId = req.header('client_id') ? req.header('client_id') : '*'
    const roleName = 'client-admin'

    const access = await verifyRoleGroupAccess(payload.sub, '', clientId, roleName)

    if (access) {
      // add decoded token payload to request object and proceed
      req.user = payload
      next()
    } else {
      return next(createError(401, 'Unauthorized: Persona does not have Client Admin on this client ' +
                'and did not obtain Admin via group membership.'
      ))
    }
  } catch (err) {
    return next(createError(401, `Unauthorized: Authorization is not valid. ${err}`))
  }
}

module.exports = {
  verifyTokenForAdmin,
  verifyTokenForSelf,
  verifyTokenForClientAdmin
}
