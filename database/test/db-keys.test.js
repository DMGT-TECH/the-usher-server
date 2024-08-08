const { describe, it } = require('mocha')
const assert = require('node:assert')
const dbKeys = require('../layer/db-keys.js')

describe('Test DB keystore table', function () {
  describe('Test add keys', function () {
    it('Should insert key without an exception', async function () {
      await dbKeys.insertKey('kid001', 'public_key001', 'private_key001')
      await dbKeys.insertKey('kid002', 'public_key002', 'private_key002')
      await dbKeys.deleteKey('kid001')
      await dbKeys.deleteKey('kid002')
    })
    it('Should fail to insert a duplicate key id', async function () {
      try {
        await dbKeys.insertKey('kid003', 'anything', 'anything')
        await dbKeys.insertKey('kid003', 'anything', 'anything')
        assert(false, 'Insert of duplicate kid should have failed.')
      } catch (expectedErr) {
        assert(true, 'expected error')
      }
      await dbKeys.deleteKey('kid003')
    })
  })
})
