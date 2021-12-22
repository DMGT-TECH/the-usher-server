require('dotenv').config()

const DEFAULT_TOKEN_LIFETIME_SECONDS = 3600 // 1 hour
const DEFAULT_SESSION_LIFETIME_SECONDS = 43200 // 12 hours

/**
 * Determine the server name depending on cloud provider and deployment method.
 */
function getServerUrl () {
  let SERVER_URL = '$SERVER_URL'
  if (process.env.PRESET_SERVER_URL) {
    SERVER_URL = process.env.PRESET_SERVER_URL
  } else if (process.env.AWS_SERVICE_ENDPOINT) {
    SERVER_URL = process.env.AWS_SERVICE_ENDPOINT
  } else if (process.env.GCP_PROJECT && process.env.FUNCTION_REGION) {
    SERVER_URL = `https://${process.env.FUNCTION_REGION}-${process.env.GCP_PROJECT}.cloudfunctions.net/the-usher`
  } else if (process.env.AZURE_APP_ENDPOINT) {
    SERVER_URL = process.env.AZURE_APP_ENDPOINT
  }
  return SERVER_URL
}

function getEnvParams () {
  const {
    PGURI,
    PGUSER,
    PGPASSWORD,
    PGHOST,
    PGPORT,
    PGDATABASE,
    PGSSL,
    TOKEN_LIFETIME_SECONDS,
    SESSION_LIFETIME_SECONDS,
    ISSUER_WHITELIST,
    ISSUER_ALIASES,
    THEUSHER_AUD_CLAIMS
  } = process.env

  if (PGURI && PGUSER && PGPASSWORD && PGHOST && PGDATABASE) {
    console.warn('Detected server environment variable PGURI in addition to other PG* variables, prioritizing the use of PGURI')
  }

  return {
    PGURI: !PGURI ? constructPgUri() : PGURI,
    TOKEN_LIFETIME_SECONDS: parseInt(TOKEN_LIFETIME_SECONDS) || DEFAULT_TOKEN_LIFETIME_SECONDS,
    SESSION_LIFETIME_SECONDS: parseInt(SESSION_LIFETIME_SECONDS) || DEFAULT_SESSION_LIFETIME_SECONDS,
    ISSUER_WHITELIST,
    ISSUER_ALIASES: !ISSUER_ALIASES ? {} : JSON.parse(ISSUER_ALIASES),
    THEUSHER_AUD_CLAIMS
  }
  function constructPgUri () {
    console.warn('Missing server environment variable PGURI, constructing from other PG* variables')
    const sslMode = PGSSL === 'true' ? 'require' : 'disable'
    return `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=${sslMode}`
  }
}

module.exports = Object.freeze({
  SERVER_URL: getServerUrl(),
  ...getEnvParams()
})
