# The Usher

## Using The Usher

### Is the plan for The Usher to be a central service managed by/run by DMGT?

No -- the plan is for each company to run and own their own instance of The Usher.  The Usher can be deployed either as a NodeJS server application or as a serverless functions application. It should be possible to deploy to AWS Lambda, Azure Functions.

### How does The Usher compare to Auth0?

Auth0 provides an excellent service for authentication in applications.  The Usher in contrast focuses completely on Authorization. (Authorization does accomodate authorization via an extension as of the current writing).

Here are a few differences between The Usher and Auth0 (with its authorization extension):

- **Auth0 has an access token size limit.** Auth0 returns access tokens in the response header, which limits their size.
- **Auth0 has no cross-app endpoints.** Auth0 does not have an API to support portal-style apps that need to ask about all the apps the user is entitled to.  This is because Auth0 authorization endpoints are client-specific.  The Usher addresses this by offering a `/self/clients` endpoint which lists all client applications on which the user has at least one role or permission.
- **No client endpoints.** If an app just wanted to get a list of roles for the user on a client application (do they have "admin?"), Auth0 does not offer such an endpoint to client apps.  The API that Auth0 offers is a management API (see next point).
- **No user-based admin API access** To allow a user to manage roles for a user for a particular client application you'd have to use the Auth0 Authorization Extension API which requires you to create a machine-to-machine application .  This means authorization to this API is not managed at the user level.  If you wanted to control which users had access, you would have to create some kind of function app/lambda to interface between the user and the machine-to-machine application.  And handle the authorizations to this app (which means you will have written The Usher -- just with added dependence on Auth0, which serves as a database.)

However, we think it is a great idea to use Auth0 to help with the authentication part of your application.

### ACL: Can The Usher's roles/permissions be used for collection-level or row-level access control?

Yes for collection-level access control, but The Usher is not designed for row-level access control use cases.

As an example, collection-level roles might look like `realEstateApp:regions:northAmerica:reader`, or might be the name of the collection-related endpoint `https://api.company.com/realEstate/regions/northAmeria:reader`.

Exercise caution to ensure the access controls are not too fine-grained. Overly fine-grained access control could result in the access token getting quite large and unwieldy. Also, having too many controls can make it difficult to manage in a CRM or CPQ system.

From a technical standpoint, if you use collection-level access controls, check that your tokens are not too large for your transport and storage mechanism. For example, be aware of the limits of using HTTP headers to pass around the access tokens, or cookies to store them.  You may need to make use of the `scope` parameter to `/self/token` to constrain the size of the token.

## Developing The Usher

### How do we get our changes in?  What's the governance model?

See [Contributing](CONTRIBUTING.md) for information on the process.
