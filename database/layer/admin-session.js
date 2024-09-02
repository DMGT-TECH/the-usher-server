const crypto = require('node:crypto')
const { usherDb } = require('./knex')

async function getSessionPersonaKey (subClaim, userContext = '', issClaim) {
  const results = await usherDb('tenants as t')
    .join('personas as p', 't.key', '=', 'p.tenantkey')
    .join('sessions as s', 'p.key', '=', 's.personakey')
    .select('p.key as personakey', 's.event_id', 's.authorization_time', 's.scope', 's.idp_token')
    .where('sub_claim', subClaim)
    .where('p.user_context', userContext)
    .where('iss_claim', issClaim)

  return (results.length === 0 ? null : results[0].personakey)
}

async function getPersonaKey (subClaim, userContext = '', issClaim) {
  const results = await usherDb('tenants as t')
    .join('personas as p', 't.key', '=', 'p.tenantkey')
    .select('p.key as personakey')
    .where('sub_claim', subClaim)
    .where('p.user_context', userContext)
    .where('iss_claim', issClaim)

  return results.length === 0 ? null : results[0].personakey
}

/**
 * Gets the most recent session record for the given User
 * @param {string} subClaim
 * @param {string} userContext
 * @param {string} issClaim
 * @returns An object representing the session record or null if no session exists
 */
async function getSessionBySubIss (subClaim, userContext, issClaim) {
  const personaKey = await getSessionPersonaKey(subClaim, userContext, issClaim)
  if (!personaKey) {
    return null
  }
  const results = await usherDb('sessions').select().where('personakey', personaKey)
    .orderBy('authorization_time', 'desc')
    .first()
  console.log(JSON.stringify(results))
  return results || null // force null return if no results instead of undefined
}

/**
 * Get a session record by a given session `event_id`
 * @param {string} eventId The session event_id to look up
 * @returns An object representing the session record
 */
async function getSessionByEventId (eventId) {
  const results = await usherDb('sessions').select().where('event_id', eventId)
  return results.length === 0 ? null : results[0]
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
  const results = await usherDb('sessions').insert({
    personakey,
    event_id: eventId,
    authorization_time: authorizationTime,
    idp_expirationtime: idpExpirationTime,
    scope,
    idp_token: idpToken
  })
  .returning('*')
  return results?.[0]
}

async function updateSessionBySubIss (subClaim, userContext, issClaim, authorizationTime, idpExpirationTime, scope, idpToken) {
  const personaKey = await getSessionPersonaKey(subClaim, userContext, issClaim)
  if (!personaKey) {
    throw new Error(`Session does not exist for persona (sub_claim=${subClaim} user_context = ${userContext} iss_claim=${issClaim})`)
  }

  const [results] = await usherDb('sessions')
    .where('personakey', personaKey)
    .update({
      authorization_time: authorizationTime,
      idp_expirationtime: idpExpirationTime,
      scope,
      idp_token: idpToken
    })
    .returning('*')
  return results
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
  const deleteResults = await usherDb('sessions').where('personakey', personakey).del()
  if (deleteResults === 1) {
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
