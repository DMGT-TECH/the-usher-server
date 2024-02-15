const { usherDb } = require('./knex')
const { pgErrorHandler } = require('../utils/pgErrorHandler')

const selectKeyWithKid = async (kid) => {
  try {
    return await usherDb('keys').where('kid', kid)
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

const selectAllKeys = async () => {
  try {
    return await usherDb('keys').select('*').orderBy('key', 'desc')
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

const selectLatestKey = async () => {
  try {
    return await usherDb('keys').select('*').orderBy('key', 'desc').first()
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

const insertKey = async (kid, publicKey, privateKey) => {
  try {
    const [insertedKey] = await usherDb('keys').insert({ kid, public_key: publicKey, private_key: privateKey }).returning('*')
    return insertedKey
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

const deleteKey = async (kid) => {
  try {
    return await usherDb('keys').where('kid', kid).del()
  } catch (err) {
    throw pgErrorHandler(err)
  }
}

module.exports = { selectKeyWithKid, insertKey, deleteKey, selectAllKeys, selectLatestKey }
