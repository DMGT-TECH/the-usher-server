const assert = require('node:assert')
const { describe, it } = require('mocha')
const { usherDb } = require('../layer/knex')
const adminClients = require('../layer/admin-client')

describe('Admin client view', () => {
  describe('Test getClients', () => {
    it('Should return all the clients', async () => {
      const { count: totalCount } = await usherDb('clients').count('*').first()
      const clients = await adminClients.getClients()
      assert.equal(clients.length, Number(totalCount))
    })

    it('Returned clients should include all the table columns', async () => {
      const columns = Object.keys(await usherDb('clients').columnInfo())
      const [client] = await adminClients.getClients()
      assert.ok(columns.every((col) => col in client))
    })
  })
})
