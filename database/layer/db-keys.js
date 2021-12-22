const { PGPool } = require('./pg_pool')
const pool = new PGPool()

async function selectKeyWithKid (kid) {
  const sql = 'SELECT * FROM usher.keys WHERE kid = $1'
  const result = await pool.query(sql, [kid])
  return result.rows
}

async function selectAllKeys () {
  const sql = 'SELECT * FROM usher.keys ORDER BY key DESC'
  const result = await pool.query(sql)
  return result.rows
}

async function selectLatestKey () {
  const sql = 'SELECT * FROM usher.keys ORDER BY key DESC LIMIT 1'
  const result = await pool.query(sql)
  return result.rows[0]
}

async function insertKey (kid, publicKey, privateKey) {
  // TODO: Security Review: Should keys be encrypted prior to storing in DB?
  const alreadyExistingKeys = await selectKeyWithKid(kid)
  if (alreadyExistingKeys.length > 0) {
    throw new Error('Insert failed. Key with kid ' + kid + ' already exists in the keystore.')
  }
  const sql = 'INSERT INTO usher.keys (kid, public_key, private_key) VALUES ($1, $2, $3)'
  try {
    await pool.query(sql, [kid, publicKey, privateKey])
    return 'Insert successful'
  } catch (error) {
    return `Insert failed: ${error.message}`
  }
}

async function deleteKey (kid) {
  const alreadyExistingKeys = await selectKeyWithKid(kid)
  if (alreadyExistingKeys.length === 1) {
    const sql = 'DELETE FROM usher.keys WHERE kid = $1'
    await pool.query(sql, [kid])
  } else {
    throw new Error('Delete failed. Key with kid ' + kid + ' not found.')
  }
}

module.exports = { selectKeyWithKid, insertKey, deleteKey, selectAllKeys, selectLatestKey }
