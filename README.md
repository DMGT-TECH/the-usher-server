# The Usher

The Usher is an authorization server that issues tokens for users authenticated by an identity provider (IdP) like Auth0 or [Microsoft Active Directory](https://docs.microsoft.com/en-us/azure/active-directory-b2c/access-tokens).  These tokens can in turn be used by a client application, API gateway, or user agent (web browser, curl, Postman, Excel) to secure access to backend resources like APIs or other company-controlled services.

Authorization is based on Roles and Permissions managed in The Usher's database.  You may choose to synchronize the roles and permissions database with a CRM or CPQ system (e.g., Salesforce via Heroku Connect).

Roles and Permissions are currently granted on a per-persona basis (persona being identified by their IdP token's `sub` claim; a roadmap item is to add support for granting based on identity provider groups; see [#48](https://github.com/DMGT-TECH/the-usher/issues/48)).


## Using The Usher for Authorization in Your Application

An application leveraging The Usher for Authorization will usually involve four components:

1. a client application (web app, mobile app, desktop app)
1. a backend resource API/server
1. an identity provider service
1. an instance of The Usher

The client application manages the login, forwarding the unauthenticated user to the identity provider, uses the IdP token to obtain an access token from The Usher, and then accesses the secured backend resource.  You could do all these steps manually using an HTTP client like cURL or Postman.

Note that information in the client itself isn't considered secured, as anyone could access that content by viewing source, disabling or modifying JavaScript, and/or decompiling. A client app should not simply inspect the token and act on permissions contained therein. Any content or service that you wish to secure should be placed in a backend resource API.

## See the Quickstart

Before writing a complete application with authorization, you might like to walk through how tokens are issued, how to configure The Usher, etc. If so, take a look at [QUICKSTART](./QUICKSTART.md).

## More Information

The following resources introduce The Usher's terminology and broad themes, and are useful references whether you plan to use The Usher in your own application or to contribute to the codebase.

* [OpenAPI Spec](./server/the-usher-openapi-spec.yaml) ([raw](https://raw.githubusercontent.com/DMGT-TECH/the-usher/master/server/the-usher-openapi-spec.yaml?token=AAP37PJSEZDBKGS4OVC5ABDBPRK6E))
* [Concepts and Glossary of Terms](./docs/GLOSSARY.md)
* [FAQ](./docs/FAQ.md)

## For Application Developers

This list of links is written for application developers looking to deploy and utilize The Usher as an Authorization Service.

* [INSTALL](./docs/INSTALL.md)
* [USAGE](./docs/USAGE.md)
  * [Sample Web Client App](https://github.com/DMGT-TECH/the-usher-testclientapp) ([deployed on Glitch](https://glitch.com/~my-theusher-client)) that obtains The Usher tokens and uses them to access a resource server.
  * [Sample Backend Resource Server (API)](https://github.com/DMGT-TECH/the-usher-testresourceserver) ([deployed on Glitch](https://glitch.com/~my-theusher-resourceserver)) that verifies The Usher-issued tokens and performs a service.
  * (Note the above are configured to run against an test instance of The Usher that is deployed by DMGT's CI/CD from [this repo](https://github.com/DMGT-TECH/the-usher-poc-config)).

## For Contributors to The Usher

This list of links is written for developers that would like to contribute to The Usher's codebase.

* [INSTALL](./docs/INSTALL.md) (follow instructions for installing from source)
* [DEVELOP](./docs/DEVELOP.md)

## What currently works


- Tokens
  - [X] Obtain tokens from The Usher with requested permissions as a scope
  - [X] Obtain tokens from The Usher with all available permissions (blank scope request)
  - [X] The Usher's tokens contain roles corresponding to scoped permissions
  - [X] Refresh tokens with sessions (currently limited to one session per persona)
- Data Model
  - [X] Permissions assigned to personas via role assigment 
  - [X] Permissions assigned directly to personas
  - [X] Support for individual personas (identified by `sub` claim) to have multiple optional "user_contexts"
- API
  - [X] OpenAPI 3 Spec for documentation and implementation. (`oas-tools` routes endpoints to code, endpoints can be easily changed)
  - [X] App portal support endpoint (`/self/clients`) that returns all clients to which a persona has access (i.e., any permissions)
- Security
  - [X] Identity providers must be whitelisted to be accepted by The Usher (token's `iss` claim)
  - [X] All endpoints except for `/.well-known/jwks.json` require an access token from an identity provider
  - [X] Support for multiple identity provider names (`iss` aliases) [experimental]
- Code/CI/CD
  - [X] Unit tests for all endpoints
  - [X] Mock identity provider server 

## What could be added

- [ ] Signing key rotation (automatic and/or via an admin API endpoint)
- [ ] Sessions and refresh tokens per persona-client (or persona-device)
- [ ] Serverless database layer (e.g., Firestore or DynamoDB)
- [ ] Scopes based on identity provider groups
- [ ] Full admin API to manage client applications, personas, roles, and permissions
