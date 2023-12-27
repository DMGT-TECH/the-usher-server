const { describe, it, before } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')

const { getAdmin1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')
const { usherDb } = require('../../database/layer/knex')


describe('Admin Personas Permissions', () => {
  let requestHeaders
  const url = `${getServerUrl()}`

  before(async () => {
    const userAccessToken = await getAdmin1IdPToken()
    requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
    }
  })

  describe('GET:/personas/{persona_key}/permissions', () => {
    const invalidPersona = 0;
    const validPersonaWithNoPermissions = 1

    it('should return 200 and a list of permissions for the persona', async function () {
      const { personakey } = await usherDb('personapermissions').select('*').first() || {}
      if (!personakey) {
        this.skip()
      }
      const response = await fetch(`${url}/personas/${personakey}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 200)
      const personaPermissions = await response.json()
      assert.equal(personaPermissions.length > 0, true)
    })

    it('should return 200 and an empty array', async () => {
      const response = await fetch(`${url}/personas/${validPersonaWithNoPermissions}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 200)
      const personaPermissions = await response.json()
      assert.equal(personaPermissions.length, 0)
    })

    it('should return 404 and fail to get permissions for an invalid persona', async () => {
      const response = await fetch(`${url}/personas/${invalidPersona}/permissions`, {
        method: 'GET',
        headers: requestHeaders,
      })
      assert.equal(response.status, 404)
    })
  })
})
