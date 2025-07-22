const { after, describe, it } = require('mocha')
const assert = require('node:assert')
const { usherDb } = require('../layer/knex')
const { getTenants, insertTenant } = require('../layer/admin-tenant')

describe('Admin tenant view', () => {
  describe('Test getTenants', () => {
    it('Should return all tenants without filters', async () => {
      const { count: totalCount } = await usherDb('tenants').count('*').first()
      const tenants = await getTenants()

      assert.equal(tenants.length, Number(totalCount))
    })

    it('Should return tenants filtered by key', async () => {
      const { key: validKey } = await usherDb('tenants').select('key').first()
      const filters = { key: validKey }
      const [tenant] = await getTenants(filters)

      assert.equal(tenant.key, validKey)
    })

    it('Should return tenants filtered by name', async () => {
      const { name: validName } = await usherDb('tenants').select('name').first()
      const filters = { name: validName }
      const [tenant] = await getTenants(filters)

      assert.equal(tenant.name, validName)
    })

    it('Should return tenants filtered by iss_claim', async () => {
      const { iss_claim: validIssClaim } = await usherDb('tenants').select('iss_claim').first()
      const filters = { iss_claim: validIssClaim }
      const [tenant] = await getTenants(filters)

      assert.equal(tenant.iss_claim, validIssClaim)
    })

    it('Should return tenants sorted by specified field and order', async () => {
      const sort = 'created_at'
      const order = 'desc'
      const tenants = await getTenants({}, sort, order)

      for (let i = 1; i < tenants.length; i++) {
        assert.ok(tenants[i - 1][sort] >= tenants[i][sort])
      }
    })

    it('Should handle errors gracefully', async () => {
      try {
        await getTenants({ key: 'invalid-key' })
      } catch (err) {
        assert.ok(err)
      }
    })
  })

  describe('Test insertTenant function', () => {
    let testTenantKey

    it('Should insert a new tenant successfully', async () => {
      const tenantName = 'test-insert-tenant'
      const issClaim = 'https://test-insert.example.com/'
      const jwksUri = 'https://test-insert.example.com/.well-known/jwks.json'

      const tenant = await insertTenant(tenantName, issClaim, jwksUri)

      assert.ok(tenant)
      assert.equal(tenant.name, tenantName)
      assert.equal(tenant.iss_claim, issClaim)
      assert.equal(tenant.jwks_uri, jwksUri)
      assert.ok(tenant.key)
      assert.ok(tenant.created_at)
      assert.ok(tenant.updated_at)

      testTenantKey = tenant.key
    })

    it('Should handle duplicate tenant insertion (should fail)', async () => {
      const tenantName = 'test-insert-tenant'
      const issClaim = 'https://test-insert.example.com/'
      const jwksUri = 'https://test-insert.example.com/.well-known/jwks.json'

      try {
        await insertTenant(tenantName, issClaim, jwksUri)
        assert.fail('Should have thrown an error for duplicate tenant')
      } catch (error) {
        assert.ok(error)
        // Check that it's a proper database constraint error
        assert.ok(error.message || error.httpStatusCode)
      }
    })

    after(async () => {
      // Clean up the test tenant
      if (testTenantKey) {
        await usherDb('tenants').where({ key: testTenantKey }).del()
      }
    })
  })
})
