require('dotenv').config()

function getEnvParams () {
  const {
    PGURI,
    PGSCHEMA,
    PGUSER,
    PGPASSWORD,
    PGHOST,
    PGPORT,
    PGDATABASE,
    PGSSL
  } = process.env

  if (!PGSCHEMA) {
    console.log('WARNING: Missing environment variable PGSCHEMA, defaulting to "usher"')
  }
  const schemaName = PGSCHEMA || 'usher'

  if (PGURI && PGUSER && PGPASSWORD && PGHOST && PGDATABASE) {
    console.warn('Detected database environment variable PGURI in addition to other PG* variables, prioritizing the use of PGURI')
  }

  return {
    PGURI: !PGURI ? constructPgUri() : PGURI,
    PGSCHEMA: schemaName
  }
  function constructPgUri () {
    console.warn('Missing database environment variable PGURI, constructing from other PG* variables')
    const sslMode = PGSSL === 'true' ? 'require' : 'disable'
    return `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=${sslMode}`
  }
}

module.exports = Object.freeze({
  ...getEnvParams()
})
