const { describe, it } = require('mocha')
const assert = require('assert')
const env = require('../../server-env')
const tokenUtils = require('../../src/utils/token-utils')

describe('JWT Token Utility Functions', () => {
  describe('calculateSessionLifetimeExpiry', () => {
    it('should return a negative time for expired idp', () => {
      const days = 3; // number of days that is longer than reasonable usher session lifetime
      const expiredDate = new Date( Date.now() - days * 24 * 60 * 60 * 1000)
      const sessionLifetimeExpiry = tokenUtils.calculateSessionLifetimeExpiry(expiredDate)
      assert(sessionLifetimeExpiry <= 0, 'The session lifetime should be negative')
    })
    it('should return positive value for 30min idp exp', () => {
      const expiredDate = new Date( Date.now() + 30 * 60 * 1000) // 30 minutes in future
      const sessionLifetimeExpiry = tokenUtils.calculateSessionLifetimeExpiry(expiredDate)
      assert(sessionLifetimeExpiry >= 0, 'The session lifetime should be positive')
      assert(sessionLifetimeExpiry <= env.SESSION_LIFETIME_SECONDS, 'The session lifetime should be less than SESSION_LIFETIME_SECONDS')
    })
    it('should return a positive value for valid idp exp', () => {
      // calculate future date less than env.SESSION_LIFETIME_SECONDS
      const expiredDate = new Date( Date.now() + (Math.floor((env.SESSION_LIFETIME_SECONDS / 3 * 1000))))
      const sessionLifetimeExpiry = tokenUtils.calculateSessionLifetimeExpiry(expiredDate)
      assert(sessionLifetimeExpiry >= 0, 'The session lifetime should be positive')
      assert(sessionLifetimeExpiry <= env.SESSION_LIFETIME_SECONDS, 'The session lifetime should be less than SESSION_LIFETIME_SECONDS')
    })
    it('should return SESSION_LIFETIME_SECONDS', () => {
      const days = 20; // number of days that is longer than reasonable usher session lifetime
      const futureDate = new Date( Date.now() + days * 24 * 60 * 60 * 1000)
      const sessionLifetimeExpiry = tokenUtils.calculateSessionLifetimeExpiry(futureDate)
      assert(sessionLifetimeExpiry === env.SESSION_LIFETIME_SECONDS, 'The session lifetime should be SESSION_LIFETIME_SECONDS')
    })
  })
})
