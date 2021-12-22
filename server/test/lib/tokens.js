const fetch = require('node-fetch')

/**
 * private function to get IdP Tokens from DMGT Auth0
 * TODO: eventually this should be made to easily work with other Providers
 * @param {string} username The username (probably email) of the User Identity
 * @param {string} password The password of the User Identity
 */
const getToken = async function (username, password) {
  const DEFAULT_ISSUER_HOST = 'http://idp.dmgt.com.mock.localhost:3002'
  return getTokenFromIssuerHost(username, password, DEFAULT_ISSUER_HOST)
}

const getTokenFromIssuerHost = async function (username, password, issuerHost) {
  const headers = {
    'Content-Type': 'application/json'
  }
  const body = JSON.stringify({
    client_id: 'SXvK7prPkRPDyElECLO1rzLBKQ3bhMur',
    client_secret: 'ZxQaZ3fCdFtsWfgvBM34os6fVG_jtXqv-eKaiG3EOQ6hgchL4zrG3kug_Lw5QYGB',
    audience: 'https://us-central1-dmgt-oocto.cloudfunctions.net/the-usher',
    scope: 'openid email read:email',
    username,
    password,
    grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
    realm: 'Username-Password-Authentication'
  })
  const issuerUri = (issuerHost.startsWith("http://") || issuerHost.startsWith("https://") ? issuerHost : 'https://' + issuerHost) + (issuerHost.endsWith("/") ? "" : "/")
  const response = await fetch(`${issuerUri}oauth/token`, { method: 'POST', headers: headers, body: body }).then(res => res.json())
  return response.access_token
}

const getAdmin1IdPToken = async function () {
  return getToken('test-admin1@dmgtoocto.com', 'password12345!')
}

const getAdmin2IdPToken = async function () {
  return getToken('test-admin2@dmgtoocto.com', 'password12345!')
}

const getTestUser1IdPToken = async function () {
  return getToken('test-user1@dmgtoocto.com', 'password12345!')
}

const getTestUser1IdPTokenFromIssuerHost = async function (issuerHost) {
  return getTokenFromIssuerHost('test-user1@dmgtoocto.com', 'password12345!', issuerHost)
}

module.exports = {
  getAdmin1IdPToken,
  getAdmin2IdPToken,
  getTestUser1IdPToken,
  getTestUser1IdPTokenFromIssuerHost
}
