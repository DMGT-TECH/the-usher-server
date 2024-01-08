const { describe, it } = require('mocha')
const assert = require('assert')
const adminPersonaRoles = require('../layer/admin-personarole')
const { usherDb } = require('../layer/knex')

describe('Admin persona roles view', () => {
  describe('Test GET personas roles', () => {
    const invalidPersonaKey = 999999
    it('Should return an array of roles for the persona', async function () {
      const { personakey } = await usherDb('personaroles').select('*').first() || {}
      if (!personakey) {
        this.skip()
      }
      const personaRoles = await adminPersonaRoles.getPersonaRoles(personakey)
      assert.equal(!!personaRoles.length, true)
      const [personaRole] = personaRoles
      assert.equal(['key', 'name', 'clientkey'].every((k) => k in personaRole), true, 'key, name, clientkey should be selected for a role ')
    })
    it('Should return an empty array', async () => {
      const personaRoles = await adminPersonaRoles.getPersonaRoles(invalidPersonaKey)
      assert.equal(personaRoles.length, 0)
    })
  })
})
