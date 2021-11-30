# The Usher Installation

This document will outline the steps necessary to deploy the Usher to a given environment for usage as an Authorization Service. Please refer to the [DEVELOP page](./DEVELOP.md) if you are looking to deploy the Usher locally for a developer / contributor use case.

The Usher was developed such that it can be run either as an node.js Express API Server or as an AWS Lambda function.

## Prerequisite Requirements

* **NodeJS** The Usher application requires NodeJS >= 14.x.
* **PostgreSQL** The Usher application requires access to a running PostgreSQL database. Please ensure you are running at least [version 12](https://www.postgresql.org/support/versioning/), as the Usher is not tested with older versions.

### Create Database Schema

On the database server, run the following command to create the schema that will be used by the Usher.
`create schema usher`

### Run Database Migrations

The Usher uses knex.js migrations pattern to manage database schema updates. This allows for a one command process to ensure the schema is up to date. As the command is idempotent to be safe this command can be run as part of every deploy of the Usher.

**Method 1**: Run migrations using Usher GitHub source with npm commands

```bash
git clone git@github.com:DMGT-TECH/the-usher.git
cd database
cp .env.sample .env
# Update value of `PGURI` connection string to point to db server
npm install
npm run migrate:latest
```

**Method 2**: Run migrations using Github The Usher Package

TODO

## Bootstrap Database with Seed Information

The above steps that run the database migrations will ensure the database schema is deployed and up to date, but there is some initial information that needs to be one-time loaded to the database in order for the Usher to be configured and start up correctly. The table below lists the initial data and descriptions that must be inserted to the database. **TODO**: In the future this process will be further automated to remove the need for manual database inserts.

| Object | Description | Table | Attributes |
|-|-|-|-|
| Tenant | The tenant that will be issuing JWT Authentication tokens | tenants | name: Unique name for Tenant iss_claim:  iss value as url jwks_uri: jwks URI |
| Usher Client | Client representing the Usher application itself | clients | client_id: `the-usher` name: `The Usher` description: `This Resource Authorization Server` secret: Secret string used for generating JWT Authorization tokens |
| Usher Admin Role | Admin role to allow administering full access to Usher system and APIs. **NOTE**: The name value must match this value | roles | clientkey: clients.key foreign key reference name: `the-usher:usher-admin` description: `Admin for the Usher` |
| Usher Tenant Admin Role | Admin role to allow administering Tenant information. **NOTE**: The name value must match this value | roles | name: `the-usher:tenant-admin` description: `Admin for the tenant` |
| First Persona (User) | This is the first User that will be able to access the Usher. Configure as Usher Admin. **NOTE**: example sub claim from Auth0 JWT token is:  `auth0\|3e432b2d8a913e0e26328274` | personas | tenantkey: tenants.key foreign key to Tenant sub_claim: sub value from Authentication provider. user_context: Can leave blank.  |
| Persona Role Join | Associate First Persona to Usher Admin Role | personaroles | personakey: personas.key foreign key for First Persona rolekey: roles.key foreign key for Usher Admin |
| Tenant Client Join | Associate Usher Client with Tenant | tenantclients | tenantkey: tenants.key foreign key for Tenant clientkey: clients.key foreign key for Usher Client |

## Run The Usher as AWS Lambda

The main usher express.js server is wrapped via the `serverless-http` library to allow it to be used as a "handler" for an AWS Lambda function.

TODO more information about how to wrap Usher with serverless.com framework

### Configure .env File

Create a `.env` file that will contain the settings to configure the Usher. You can copy the existing `.env.sample` and modify values as appropriate.

**PLEASE NOTE** the following:

* the `.env` file should be located in `server` subdirectory
* You have the option of specifying values as environment variables which will override the `.env` file.

The following variables are required to be configured.

| Parameter                | Description                                              |
|--------------------------|----------------------------------------------------------|
| PGURI                    | Database connection string                               |
| PGSCHEMA                 | Database schema name                                     |
| TOKEN_LIFETIME_SECONDS   | Number of seconds Access Token is valid                  |
| SESSION_LIFETIME_SECONDS | Number of seconds Refresh Token is valid                 |
| ISSUER_WHITELIST         | Comma separated list of authorized Issuer Servers        |
| THEUSHER_AUD_CLAIMS      | Comma separated list of authorized audience (aud) claims |

## Generic Installation Steps

The following two methods consist of the general steps to get the Usher project installed via either GitHub Packages or source.

### Installing from GitHub Release Packages

1. Create an empty folder
1. In that folder, create a file `.npmrc` and add the line `registry=https://npm.pkg.github.com/DMGT-TECH` to it. The numbers below specify the version you would like to install. Please see the [GitHub repo](https://github.com/DMGT-TECH/the-usher/packages) for the latest published packages.

```bash
npm init
npm install --save @dmgt-tech/database@npm:@dmgt-tech/the-usher-database@1.3.4
npm install --save @dmgt-tech/the-usher@1.3.4
```

To run, you can `cd node_modules/@dmgt-tech/the-usher/`, add a `.env` file, and then `npm start`.

### Installing from Source

The following commands provide the basic steps that are involved with downloading and running the Usher. You can then adapt these steps to suite your specific use case.

```bash
git clone https://github.com/DMGT-TECH/the-usher

cd server
npm install

cd ../database
npm install
```

### Start Usher Application

**Before running `npm start` make sure you have a `.env` file set up under the `/server` folder. See `env.sample` for the environment variables that must be set and example values.**

1. Create a `.env` file, you can copy the existing `.env.sample` and modify values. **PLEASE NOTE**:

    * the `.env` file should be located in `server` subdirectory
    * environment variable values override the .env file
    * if both individual parameters and `PGURI` are defined, the `PGURI` variable takes precedence

1. `cd server`
1. `npm start`
1. Optionally, run the tests by doing `npm test`. For more information see the server README.
