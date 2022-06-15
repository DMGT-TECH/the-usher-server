const fs = require('fs').promises
const STORE_FILENAME = "./keystore.json"

/**
 * A minimalist keystore, storing in a local file.
 */
async function selectLatestKey() {
  const store = await selectAllKeys()
  const sorted = store.sort(function (a,b) {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (dateA > dateB) return -1
    if (dateA < dateB) return 1
    return 0;
  })
  return sorted[0]
}

async function insertKey(newDate, newPublicKey, newPrivateKey) {
  const data = {"date": newDate, "public_key": newPublicKey, "private_key": newPrivateKey, "kid": newDate}
  let store
  try {
    store = JSON.parse(await fs.readFile(STORE_FILENAME, { encoding: 'utf8' }))
    store.push(data)
  }
  catch (err) {
    store = [data]
  }
  const filehandle = await fs.open(STORE_FILENAME, 'w')
  await filehandle.write(JSON.stringify(store), { encoding: 'utf8' })
  await filehandle.close()
}

async function selectAllKeys() {
  let store
  try {
    store = JSON.parse(await fs.readFile(STORE_FILENAME, { encoding: 'utf8' }))
  } catch {
    store = []
  }
  return store
}

module.exports = { insertKey, selectAllKeys, selectLatestKey }
