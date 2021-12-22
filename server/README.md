# Usher Server

The Usher server is an express REST API that provides endpoints for managing authorization services. The server entry point is set up in such a way that it can be included in other runtime environments such as within AWS Lambda functions.

## JWT Middleware

There are two oas security middleware functions to implement checks for the "self" endpoints and the "admin" endpoints. Each of these middleware add the decoded JWT payload as an attribute named `user` to the request object, [similar to the express-jwt middleware](https://github.com/auth0/express-jwt#retrieving-the-decoded-payload). This `req.user` object can then be used in any API methods that need information from the JWT payload.

## Running Unit Tests

Tests can be run via the npm script:  `npm test`. The tests will default to running against a server running on localhost, but an environment variable, `TEST_THEUSHER_SERVER` can be set to use instead for the tests. This should contain the protocol, host, and port and should **not** contain a trailing slash.
