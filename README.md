# The Usher

The Usher is an authorization server that issues tokens for users authenticated by an identity provider (IdP) like Auth0 or [Microsoft Active Directory](https://docs.microsoft.com/en-us/azure/active-directory-b2c/access-tokens).  These tokens can in turn be used by a client application, API gateway, or user agent (web browser, curl, Postman, Excel) to secure access to backend resources like APIs or other company-controlled services.

Authorization is based on Roles and Permissions granted in The Usher's database.  You may choose to synchronize the roles and permissions database with a CRM or CPQ system (e.g., Salesforce via Heroku Connect).

Roles and Permissions are currently granted on a per-persona basis (persona being identified by their IdP token's `sub` claim; a roadmap item is to add support for granting based on identity provider groups; see [#48](https://github.com/DMGT-TECH/the-usher/issues/48)).

## Resources

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

## What works



## What could be added


