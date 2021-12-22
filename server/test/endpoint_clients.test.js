const { describe, it } = require('mocha')
// const fetch = require('node-fetch')
const assert = require('assert')
require('dotenv').config()
// const { PGPool } = require('database/layer/pg_pool')
// const pool = new PGPool()

// const { getAdmin1IdPToken, getAdmin2IdPToken } = require('./lib/tokens')
// const { getServerUrl } = require('./lib/urls')

describe('Admin Clients Endpoint Test', function () {
  // const url = `${getServerUrl()}/clients`

  it.skip('Should identify these tests are commented out during minimal spec development', function () {
    assert(true, 'Tests not run')
  })
  // let accessTokenTestAdmin1 = ''
  // let accessTokenTestAdmin2 = ''

  // before(async function () {
  //   accessTokenTestAdmin1 = await getAdmin1IdPToken()
  //   accessTokenTestAdmin2 = await getAdmin2IdPToken()
  // })

  // it('The-Usher Admin can see all clients managed on the server', async function () {
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${accessTokenTestAdmin1}`
  //   }
  //   const request = await fetch(url, { method: 'GET', headers: headers })
  //   const data = await request.json()
  //   const expectedClientIds = (await pool.query('SELECT * FROM usher.clients')).rows.map(x => x.client_id)

  //   const foundClientIds = []
  //   for (const c of data) {
  //     foundClientIds.push(c.client_id)
  //   }
  //   assert.deepStrictEqual(foundClientIds.sort().join(','), expectedClientIds.sort().join(','), 'Client IDs should match all from database')
  // })

  // it('Test-Admin2 can see its clients', async function () {
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${accessTokenTestAdmin2}`,
  //     client_id: 'site-iq'
  //   }
  //   const request = await fetch(url, { method: 'GET', headers: headers })
  //   const data = await request.json()
  //   const expectedClientIds = (await pool.query("SELECT * FROM usher.clients WHERE client_id in ('site-iq','exposure-iq')")).rows.map(x => x.client_id)

  //   const foundClientIds = []
  //   for (const c of data) {
  //     foundClientIds.push(c.client_id)
  //   }

  //   assert.deepStrictEqual(expectedClientIds.sort().join(','), foundClientIds.sort().join(','), 'Client IDs should match all from database')
  // })

  // it('The-Usher Admin can add a client on the server', async function () {
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     Authorization: 'Bearer ' + accessTokenTestAdmin1
  //   }
  //   const body = {
  //     client_id: 'test-client-insert',
  //     name: 'Client Insert Test',
  //     description: 'A client inserted to test admin functionality',
  //     secret: 'shhh_dont_tell'
  //   }
  //   await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) })

  //   const expectedClientInserted = (await pool.query("SELECT name FROM usher.clients WHERE client_id = 'test-client-insert'")).rows[0].name

  //   if (expectedClientInserted === 'Client Insert Test') {
  //     // Replace with delete function when written
  //     try {
  //       await pool.query("DELETE FROM usher.clients WHERE client_id = 'test-client-insert'")
  //       assert(true, 'Client inserted successfully')
  //     } catch (error) {
  //       assert(false, error.message)
  //     }
  //   } else {
  //     assert(false, 'Client not successfully inserted')
  //   }
  // })
})
