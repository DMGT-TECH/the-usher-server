# The Usher

The Usher is a minimalist authorization server. It issues tokens for users authenticated by an identity provider (IdP) like [Auth0](https://auth0.com) or [Microsoft Active Directory](https://docs.microsoft.com/en-us/azure/active-directory-b2c/access-tokens).  These tokens can in turn be used by a client application, API gateway, or user agent (web browser, curl, Postman, Excel) to secure access to backend resources like APIs or other company-controlled services.

The Usher authorizes access by looking up roles and permissions in The Usher's database associated with the `sub` claim in the IdP token.  You may choose to synchronize the database with a CRM or CPQ system (e.g., Salesforce via Heroku Connect), so that authorizations reflect up-to-date information on purchases or subscriptions.

The Usher is based on there being a clear distinction between authorization and authentication. In particular, it is not possible to do authentication or otherwise manage identity with The Usher.

![The Usher Logo](./docs/the-usher-logo-wide.png)

## Using The Usher for Authorization in an Application

An application leveraging The Usher for Authorization will usually involve four components:

1. **a client application**: a web app, mobile app, or desktop app, etc. that initiates the login process, forwarding the unauthenticated user to the identity provider, passes the obtained IdP token to The Usher to obtain an access token, and then accesses the secured backend resource.  Note, you could do all these steps manually by directly using a user agent, like cURL or Postman.
1. **a backend resource API/server** hosts the service that is to be secured by The Usher's access tokens.
1. **an identity provider (IdP) service** issues an IdP token based on authentication credentials (like username and password)
1. **an instance of The Usher** provides, among others, the `/self/token` endpoint which issues an authorization token based on the token from the IdP.

Generally speaking, any content or service that you wish to secure should be placed in a backend resource API, not stored in the client and "unlocked" by receiving a token with the right permissions. Data or services stored in clients cannot be considered secured, as anyone could access that content by viewing source, disabling or modifying it, and/or decompiling.

## See the Quickstart

Before writing a complete application with The Usher for authorization, you might like to walk through how tokens are issued, how to configure The Usher, etc. If so, take a look at [QUICKSTART](./docs/QUICKSTART.md).

## More Information

The following resources introduce The Usher's terminology and broad themes, and are useful references whether you plan to use The Usher in your own application or to contribute to the codebase.

* [OpenAPI Spec](./server/the-usher-openapi-spec.yaml)
* [Concepts and Glossary of Terms](./docs/GLOSSARY.md)
* [Data Model](./docs/DATAMODEL.md)
* [FAQ](./docs/FAQ.md)

## For Application Developers

This list of links is written for application developers looking to deploy and utilize The Usher as an Authorization Service.

* [INSTALL](./docs/INSTALL.md)
* [USAGE](./docs/USAGE.md)
  * [Sample Web Client App](https://github.com/DMGT-TECH/the-usher-democlient) that obtains The Usher tokens and uses them to access a resource server.
  * [Sample Backend Resource Server (API)](https://github.com/DMGT-TECH/the-usher-demoresource) that verifies The Usher-issued tokens and performs a service.

You can run the sample client and resource servers, or host them somewhere.  During early development of The Usher, we hosted instances of these on glitch.com.

## For Contributors to The Usher

This list of links is written for developers that would like to contribute to The Usher's codebase.

* [CONTRIBUTING](./docs/CONTRIBUTING.md) (governance model and process for contributing)
* [DEVELOP](./docs/DEVELOP.md) (use docker-compose to bring up your dev environment)

## What currently works

* Tokens
  * [X] Obtain tokens from The Usher with requested permissions as a scope
  * [X] Obtain tokens from The Usher with all available permissions (blank scope request)
  * [X] The Usher's tokens contain roles corresponding to scoped permissions
  * [X] Refresh tokens with sessions (currently limited to one session per persona)
* Data Model
  * [X] Permissions assigned to personas via role assigment
  * [X] Permissions assigned directly to personas
  * [X] Support for individual personas (each identified by same `sub` claim) to have multiple optional "user_contexts"
* API
  * [X] OpenAPI 3 Spec for documentation
  * [X] OpenAPI 3 Spec for implementation (`oas-tools` routes endpoints to code, endpoints can be easily renamed)
  * [X] App portal support endpoint (`/self/clients`) that returns all clients to which a persona has access (i.e., any permissions)
* Security
  * [X] Identity providers must be whitelisted to be accepted by The Usher (token's `iss` claim)
  * [X] All endpoints except for `/.well-known/jwks.json` require an access token from an identity provider
  * [X] Support for multiple identity provider names (`iss` aliases) [experimental]
* Code/CI/CD
  * [X] Unit tests for all endpoints
  * [X] Mock identity provider server

## What is in progress

* [ ] Implement Groups functionality (see https://github.com/DMGT-TECH/the-usher-server/issues/2)

## What could be added

* [ ] Signing key rotation (automatic and/or via an admin API endpoint)
* [ ] Sessions and refresh tokens per persona-client (or persona-device)
* [ ] Serverless database layer (e.g., Firestore or DynamoDB)
* [ ] Scopes based on identity provider groups
* [ ] Full admin API to manage client applications, personas, roles, and permissions
* [ ] API endpoint to return a list of `user_contexts` available for a persona
