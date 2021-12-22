const { describe, it, before, after } = require('mocha')
const fetch = require('node-fetch')
const assert = require('assert')
const { v4: uuidv4 } = require('uuid')
const postSessions = require('database/layer/admin-session')

const { getAdmin1IdPToken } = require('./lib/tokens')
const { getServerUrl } = require('./lib/urls')

describe('Invalidate session', () => {
  const method = 'DELETE'
  const url = `${getServerUrl()}/sessions`
  let headers = {}
  let idpToken = ''

  before(async function () {
    // GET IDENTITY-PROVIDER TOKEN (ADMIN)
    idpToken = await getAdmin1IdPToken()

    const subClaim = 'mockauth0|5e472b2d8a409e0e62026856'
    const issClaim = 'http://idp.dmgt.com.mock.localhost:3002/'

    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idpToken}`
    }

    try {
      await postSessions.deleteSessionBySubIss(subClaim, '', issClaim)
    } catch (err) {
      // noop, this is ok if session for persona does not exist
    }
    // insert session
    const idpExpirationDateTime = new Date()
    idpExpirationDateTime.setMinutes(idpExpirationDateTime.getMinutes() + 30)
    await postSessions.insertSessionBySubIss(subClaim, '', issClaim, uuidv4(), new Date(), idpExpirationDateTime, 'scope', 'eydsagdsadahdhwwgywqrwqrqrwqwqy')
  })

  after(async function () {
    const subClaim = 'mockauth0|5e472b2d8a409e0e62026856'
    const issClaim = 'http://idp.dmgt.com.mock.localhost:3002/'
    try {
      await postSessions.deleteSessionBySubIss(subClaim, '', issClaim)
    } catch (err) {
      // noop, this is ok if session for persona does not exist
    }
  })

  describe('Error responses', () => {
    it('should return a bad request response when invalid "sub" query parameter', async function () {
      // arrange
      const subClaim = ''
      const userContext = ''
      const issClaim = 'http://idp.dmgt.com.mock.localhost:3002/'

      // act
      const response = await fetch(`${url}?sub=${subClaim}&ucx=${userContext}&iss=${issClaim}`, { method: method, headers: headers })
      const responseBody = await response.text()
      const responseJSON = JSON.parse(responseBody)
      const statusCode = response.status

      // assert
      assert(statusCode === 400, `Expected response status code to be 400 but was ${statusCode}`)
      assert(responseJSON.message === 'Wrong parameter sub in query. ', `Actual response body: ${responseBody}`)
    })

    it('should return a bad request response when invalid "iss" query parameter', async function () {
      // arrange
      const subClaim = 'mockauth0|5e472b2d8a409e0e62026856'
      const userContext = ''
      const issClaim = ''

      // act
      const response = await fetch(`${url}?sub=${subClaim}&ucx=${userContext}&iss=${issClaim}`, { method: method, headers: headers })
      const responseBody = await response.text()
      const responseJSON = JSON.parse(responseBody)
      const statusCode = response.status

      // assert
      assert(statusCode === 400, `Expected response status code to be 400 but was ${statusCode}`)
      assert(responseJSON.message === 'Bad request: Query parameter "iss" must have a value.', `Actual response body: ${responseBody}`)
    })

    it('should return a forbidden response when "iss" does not match admin issuer', async function () {
      // arrange
      const subClaim = 'mockauth0|5e472b2d8a409e0e62026856'
      const userContext = ''
      const issClaim = 'foo'

      // act
      const response = await fetch(`${url}?sub=${subClaim}&ucx=${userContext}&iss=${issClaim}`, { method: method, headers: headers })
      const responseBody = await response.text()
      const responseJSON = JSON.parse(responseBody)
      const statusCode = response.status

      // assert
      assert(statusCode === 403, `Expected response status code to be 403 but was ${statusCode}`)
      assert(responseJSON.message === 'Forbidden: Cannot invalidate session for a different issuer.', `Actual response body: ${responseBody}`)
    })

    it('should return a not found response when no match persona found for sub and ucx and iss', async function () {
      // arrange
      const subClaim = 'foo'
      const userContext = ''
      const issClaim = 'http://idp.dmgt.com.mock.localhost:3002/'

      // act
      const response = await fetch(`${url}?sub=${subClaim}&ucx=${userContext}&iss=${issClaim}`, { method: method, headers: headers })
      const responseBody = await response.text()
      const responseJSON = JSON.parse(responseBody)
      const statusCode = response.status

      // assert
      assert(statusCode === 404, `Expected response status code to be 404 but was ${statusCode}`)
      assert(responseJSON.message.includes(`Session does not exist for persona (sub_claim = ${subClaim} user_context = ${userContext} iss_claim = ${issClaim})`), `Actual response body: ${responseBody}`)
    })
  })

  describe('Success responses', () => {
    it('should return a successful response', async function () {
      // arrange
      const subClaim = 'mockauth0|5e472b2d8a409e0e62026856'
      const userContext = ''
      const issClaim = 'http://idp.dmgt.com.mock.localhost:3002/'

      // act
      const response = await fetch(`${url}?sub=${subClaim}&ucx=${userContext}&iss=${issClaim}`, { method: method, headers: headers })
      const statusCode = response.status

      // assert
      assert(statusCode === 200, `Expected response status code to be 200 but was ${statusCode}`)
    })
  })
})
