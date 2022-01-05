# Installing The Usher

This document outlines the steps necessary to deploy the Usher to a production environment for usage as an authorization service. Please refer to the [DEVELOP page](./DEVELOP.md) if you are looking to deploy the Usher locally for the developer / contributor use case.

## Requirements

* **NodeJS** The Usher application requires NodeJS >= 14.x.
* **PostgreSQL** The Usher application requires access to a running PostgreSQL database. Please ensure you are running at least [version 12](https://www.postgresql.org/support/versioning/), as the Usher is not tested with older versions.

## Set Up the PostgreSQL Database

### Create Database Schema

On the database server, run the following command to create the schema that will be used by the Usher.

```bash
create schema usher
```

### Run Database Migrations

The Usher uses `knex.js` migrations to manage database schema updates. This allows for a one-command process to ensure the schema is up to date. As the command is idempotent to be safe this command can be run as part of every deploy of the Usher.

**Method 1**: Run migrations using Usher GitHub source with npm commands

```bash
git clone git@github.com:DMGT-TECH/the-usher-server.git
cd database
cp .env.sample .env
# Update value of `PGURI` connection string to point to the database server
npm install
npm run migrate:latest
```

The above steps that run the database migrations will ensure the database schema is deployed and up to date.

### Populate Database

Populate The Usher's database according with the appropriate data given the [data model](./DATAMODEL.md).

## Set up The Usher Server

The Usher was developed such that it can be deployed either as a `node.js` Express API Server or as an AWS Lambda function.

### Configure .env File

Create a `.env` file that will contain the settings to configure the Usher. You can copy the existing `.env.sample` and modify values as appropriate.

**PLEASE NOTE** the following:

* the `.env` file should be located in the `./server/` subdirectory
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
| PRESET_SERVER_URL        | (Optional) URI to use as `iss` claim for issued tokens   |
| ISSUER_ALIASES           | (Optional && Experimental) [Hostname aliases](USAGE.md#migrating-idenitity-provider-domain-names-issuer-aliases-experimental) for IdP tokens issuer |

## Generic Installation Steps

The following two methods consist of the general steps to get the Usher project installed via either GitHub Packages or source.

### Installing from GitHub Release Packages

1. Create an empty folder
1. In that folder, create a file `.npmrc` and add the line `registry=https://npm.pkg.github.com/DMGT-TECH` to it. The numbers below specify the version you would like to install. Please see the [GitHub repo](https://github.com/DMGT-TECH/theusher-server/packages) for the latest published packages.

```bash
npm init
npm install --save @dmgt-tech/database@npm:@dmgt-tech/the-usher-server-database@1.4.2
npm install --save @dmgt-tech/the-usher-server@1.4.2
```

To run, you can `cd node_modules/@dmgt-tech/the-usher-server/`, add a `.env` file, and then `npm start`.

### Installing from Source

The following commands provide the basic steps that are involved with downloading and running the Usher. You can then adapt these steps to suite your specific use case.

```bash
git clone https://github.com/DMGT-TECH/the-usher-server

cd server
npm install

cd ../database
npm install
```

### Deploy and/or Run as a Lambda

The Usher's express.js server is wrapped with the `serverless-http` library to allow it to be used as a "handler" for an AWS Lambda function.

### Deploy and/or Run as a NodeJS Express App

**Before running `npm start` make sure you have a `.env` file set up under the `/server` folder. See `env.sample` for the environment variables that must be set and example values.**

1. Create a `.env` file, you can copy the existing `.env.sample` and modify values. **PLEASE NOTE**:

    * the `.env` file should be located in `server` subdirectory
    * environment variable values override the .env file
    * if both individual parameters and `PGURI` are defined, the `PGURI` variable takes precedence

1. `cd server`
1. `npm start`
1. Optionally, run the tests by doing `npm test`. For more information see the server README.

## Conclusion

With the database up and running and populated (according to the [data model](./DATAMODEL.md)), and The Usher launched with a configuration to point to it (based on [the correct .env value](../server/.env.sample)), you're now ready to start requesting tokens!
