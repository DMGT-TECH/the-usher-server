# The Usher Usage

## See the Quickstart

Before writing a complete application with authorization, you might like to walk through how tokens are issued, how to configure The Usher, etc. If so, take a look at [QUICKSTART](./QUICKSTART.md).

## Writing an Application with Authorization

An application leveraging The Usher for Authorization will usually have four components:

1. a client application (web app, mobile app, desktop app)
1. a backend resource API/server
1. an identity provider service
1. an instance of The Usher

The client application manages the login, forwarding the unauthenticated user to the identity provider, uses the IdP token to obtain an access token from The Usher, and then accesses the secured backend resource.  You could do all these steps manually using an HTTP client like cURL or Postman.
Note that information in the client itself isn't considered secured, as anyone could access that content by viewing source, disabling JavaScript, and/or decompiling.  So, any content or service that you wish to secure should be stored in the backend API.

### Getting Started

Note that you could run all of these components locally on your workstation. However we don't have an identity provider implementation, so you'll probably want to rely on something like Auth0 or Azure AD. We have used Auth0 during development and it supports redirects to localhost.

1. Make sure to have an instance of The Usher up and running somewhere.
   1. **[CONFIG]** Decide if you wish to have The Usher validate the `audience` claim of the IdP tokens that the client application will pass to it.  If not, remove `THEUSHER_AUD_CLAIMS` from The Usher's .env file.
   1. If you opt for validating the IdP `audience` claim, generate a string for this. It could simply be the URL of The Usher's instance. Configure it, possibly including localhost if testing locally, as `THEUSHER_AUD_CLAIMS=https://us-central1-dmgt-oocto.cloudfunctions.net/the-usher,http://localhost:3001`. The value can be a comma-separated list of URLs.
1. Set up your identity provider with at least 1 user. This user could be set up with SSO or via a password database in your identity provider. Determine their `sub_claim`. (In Auth0 this might look like `auth0|5e5feabeb087080ddea78663`).
   1. If using Auth0: Register an API for The Usher, and set its Identifier (the `audience` claim it will put in the IdP tokens) to the claim The Usher expects.
   1. Also, note the **Token Expiration (seconds) Setting** attribute within Auth0 / IdP as this will serve as the maximum value for the Refresh Token window (ceiling of this value or `SESSION_LIFETIME_SECONDS`).
1. Into The Usher's PostgreSQL database, insert information about your tenant, personas, roles and permissions.
   1. Tenant information: include the JWKS URL The Usher will use for IdP token validation (e.g., <https://dmgt-prod.auth0.com/.well-known/jwks.json>)
   1. Persona information: include the `sub_claim` for each persona
1. Decide on a place to host your client application, and a place to host your backend resource API.
1. Write your client application to perform the flow of steps listed below (and/or see the demo client application).
1. Write your backend resource API to validate the token from The Usher and check scopes before returning data or performing services.

## General Application Flow

The general flow for an application that uses The Usher is:

1. A user attempts to access an application (henceforth called the `client application`). But the not logged user in (does not have an identity token).
1. The user is redirected and authenticates with their organization's Identity Provider (IdP).
1. The IdP token has a sub claim, and may also have group claims.
1. If a portal, the client application may use the IdP token to determine the other client applications to which the user has access by calling The Usher `/self/clients/` endpoint
1. The client application uses the IdP token and its `client_id` (and `client_secret`) to get an `access_token` from The Usher via the `/self/token` endpoint
1. The client application will then use the `access_token` to access resources like APIs and backend services.
1. The client application may use the refresh token to obtain a new access token if necessary (and supported).

These steps are implemented in the demo application below.  The application runs against an instance of The Usher managed by DMGT's CI/CD (configured [here](https://github.com/DMGT-TECH/the-usher-poc-config)).

For illustrations of specific flows, see the Web Sequence diagrams collected [here](../diagrams/).

## Demo Client App Obtaining/Refreshing a Token and using it to access an API

Here is a demo client application illustrating how to request an token from The Usher and use it to access an API.

* Sample Web Client App ([source code](https://github.com/DMGT-TECH/the-usher-testclientapp) |  [deployed to Glitch](https://glitch.com/~my-theusher-client))

## Demo API Verifying a Token and Checking Scopes

Here is a demo backend resource server API that verifies tokens issued by The Usher, and  checks scopes prior to yielding access.

* Sample Backend Resource Server (API) ([source code](https://github.com/DMGT-TECH/the-usher-testresourceserver) | [deployed to Glitch](https://glitch.com/~my-theusher-resourceserver))

## Administering The Usher

### Admin API

(Coming soon)

### Manually Inserting Roles and Permissions

Roles and permissions can be assigned to personas by inserting it into the database.  Examples of inserting sample data can be found in the [database/init](https://github.com/DMGT-TECH/the-usher/tree/master/database/init) directory.  See the files with "sample" in the filename.

### Heroku Connect (Salesforce Sync)

(Coming soon)

### Migrating Idenitity Provider Domain Names (Issuer Aliases) [Experimental]

The Usher supports an experimental feature to assist with gradually migrating a set of applications to another issuer domain name.  This feature is called Issuer Aliases.

As part of branding or refactoring, an organization using The Usher may wish to migrate their identity provider issuer claim to a new claim. Some identity providers, like Auth0, allow to use your own custom branded domain name. If this migration cannot happen at once for all services authorized via The Usher tokens, The Usher will need to simultaneously accept identity provider tokens with two distinct issuer claims.

To use Issuer Aliases, update The Usher's configuration to:

1. list the custom domain name in the `ISSUER_WHITELIST` configuration/environment variable
1. create a dictionary in a new configuration/environment variable called `ISSUER_ALIASES` mapping the new custom domain name(s) to the domain name registered in The Usher's database (`tenant` table).

#### Example

For example, suppose there is an instance of The Usher with a tenant having an `iss_claim` of `"dmgt-test.auth0.com"`. If an organization were to begin migrating to an `iss` claim of `"auth.labs.dmgt.com"`, they will configure `ISSUER_ALIASES` to be:

```json
{"auth.labs.dmgt.com": "dmgt-test.auth0.com"}
```

With the above configuration, if a token is presented from identity provider with `iss` claim `"auth.labs.dmgt.com"`, the JWKS used to validate the signature will be the same as for tokens with `iss` claim `"dmgt-test.auth0.com"`.

As noted above, for security reasons, the alias must also be whitelisted (listed in `ISSUER_WHITELIST`):

```json
["dmgt-test.auth0.com", "auth.labs.dmgt.com"]
```
