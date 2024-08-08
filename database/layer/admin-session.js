const crypto = require('node:crypto')
const { PGPool } = require('./pg_pool')
const pool = new PGPool()

function getAdminSessionView () {
  return `SELECT p.key AS personakey, s.event_id, s.authorization_time, s.scope, s.idp_token
            FROM usher.tenants t
            JOIN usher.personas p ON p.tenantkey = t.key
            JOIN usher.sessions s ON s.personakey = p.key`
}

function getAdminTenantPersonaView () {
  return `SELECT p.key as personakey
            FROM usher.tenants t
            JOIN usher.personas p ON p.tenantkey = t.key`
}

async function getSessionPersonaKey (subClaim, userContext = '', issClaim) {
  const sql = getAdminSessionView() + ' WHERE sub_claim = $1 AND p.user_context = $2 AND iss_claim = $3'
  const sessionKeyResult = await pool.query(sql, [subClaim, userContext, issClaim])
  return (sessionKeyResult.rows.length === 0 ? null : sessionKeyResult.rows[0].personakey)
}

async function getPersonaKey (subClaim, userContext = '', issClaim) {
  const sql = getAdminTenantPersonaView() + ' WHERE sub_claim = $1 AND p.user_context = $2 AND iss_claim = $3'
  const personaKeyResult = await pool.query(sql, [subClaim, userContext, issClaim])
  return personaKeyResult.rows.length === 0 ? null : personaKeyResult.rows[0].personakey
}

async function getSessionBySubIss (subClaim, userContext, issClaim) {
  const personaKey = await getSessionPersonaKey(subClaim, userContext, issClaim)
  if (!personaKey) {
    return null
  }
  const sql = 'SELECT * FROM usher.sessions WHERE personakey = $1'
  const sessionRowResult = await pool.query(sql, [personaKey])
  return sessionRowResult.rows[0]
}

async function getSessionByEventId (eventId) {
  const sql = 'SELECT * FROM usher.sessions WHERE event_id = $1'
  const sessionRowResult = await pool.query(sql, [eventId])
  return sessionRowResult.rows.length === 0 ? null : sessionRowResult.rows[0]
}

async function insertSessionBySubIss (
  subClaim,
  userContext,
  issClaim,
  eventId,
  authorizationTime,
  idpExpirationTime,
  scope,
  idpToken
) {
  let personaKey = await getSessionPersonaKey(subClaim, userContext, issClaim)
  if (personaKey) {
    throw new Error(`Session already exists for persona (sub_claim=${subClaim} user_context = ${userContext} iss_claim=${issClaim}). One session per persona allowed.`)
  }
  personaKey = await getPersonaKey(subClaim, userContext, issClaim)
  await insertSessionByPersonaKey(personaKey, eventId, authorizationTime, idpExpirationTime, scope, idpToken)
  return 'Inserted successfully'
}

async function insertSessionByPersonaKey (personakey, eventId, authorizationTime, idpExpirationTime, scope, idpToken) {
  const sql = `INSERT INTO usher.sessions
  (personakey, event_id, authorization_time, idp_expirationtime, scope, idp_token)
  VALUES ($1, $2, $3, $4, $5, $6)`
  return pool.query(sql, [personakey, eventId, authorizationTime, idpExpirationTime, scope, idpToken])
}

async function updateSessionBySubIss (subClaim, userContext, issClaim, authorizationTime, idpExpirationTime, scope, idpToken) {
  const personaKey = await getSessionPersonaKey(subClaim, userContext, issClaim)
  if (!personaKey) {
    throw new Error(`Session does not exist for persona (sub_claim=${subClaim} user_context = ${userContext} iss_claim=${issClaim})`)
  }

  const sql = 'UPDATE usher.sessions SET authorization_time = $1, idp_expirationtime = $2, scope = $3, idp_token = $4 WHERE personakey = $5'
  const results = await pool.query(sql, [authorizationTime, idpExpirationTime, scope, idpToken, personaKey])
  return results.rows
}

/**
 * Create a new session record for the given User, or update an existing session record for the User
 *
 * @param {Object} sessionData - Object containing user and idp token information
 * @param {string} sessionData.subClaim - The idp sub claim value for the User
 * @returns The event_id, which is used as the refresh_token for the given User
 */
async function createOrUpdateSession ({ subClaim, userContext, issClaim, scope, encodedIdpToken, idpExpirationTime }) {
  const authorizationTime = new Date()
  const session = await getSessionBySubIss(subClaim, userContext, issClaim)

  if (session) {
    await updateSessionBySubIss(subClaim, userContext, issClaim, authorizationTime, idpExpirationTime, scope, encodedIdpToken)
    return session.event_id
  } else {
    const eventId = crypto.randomUUID()
    await insertSessionBySubIss(subClaim, userContext, issClaim, eventId, authorizationTime, idpExpirationTime, scope, encodedIdpToken)
    return eventId
  }
}

async function deleteSessionBySubIss (subClaim, userContext, issClaim) {
  const personaKey = await getSessionPersonaKey(subClaim, userContext, issClaim)
  if (!personaKey) {
    throw new Error(`Session does not exist for persona (sub_claim = ${subClaim} user_context = ${userContext} iss_claim = ${issClaim})`)
  }
  const deleteReturn = await deleteSessionByPersonaKey(personaKey)
  return deleteReturn
}

async function deleteSessionByPersonaKey (personakey) {
  const sql = 'DELETE FROM usher.sessions WHERE personakey = $1'
  const deleteReturn = await pool.query(sql, [personakey])
  if (deleteReturn.rowCount === 1) {
    return 'Delete successful'
  } else {
    return 'Delete unsuccessful'
  }
}

module.exports = {
  getSessionBySubIss,
  getSessionByEventId,
  insertSessionBySubIss,
  insertSessionByPersonaKey,
  updateSessionBySubIss,
  createOrUpdateSession,
  deleteSessionBySubIss,
  deleteSessionByPersonaKey
}
