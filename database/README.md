# Database Overview

This folder contains the code related to managing and bootstrapping a database for The Usher. It leverages [knexjs](http://knexjs.org/#Migrations) for mananging schema migrations and loading seed data.

## Getting Started

1. Ensure you have a running postgres database available, for development you can use pg from the docker-compose file in the project root.
1. Create a `.env` file, you can copy the existing `.env.sample` and modify values. **PLEASE NOTE**:
    - the variable for `PGSCHEMA` is needed for the migrations usage
    - in the future it will allow for the removal of hard-coded `usher` schema name in queries
    - if both individual parameters and `PGURI` are defined, the `PGURI` variable takes precedence
1. One time TODO: currently you must manually create the schema. Run the following sql command against the postgres database: `create schema usher`. Alternatively you can run `npm run db-drop-create-schema` to drop an existing schema and create a new one.
1. Install packages:  `npm install`
1. Run the migrations: `npm run migrate:latest`
1. Run the seed data: `npm run seed:run`
1. Run the test data:  `npm run db-reset-test-data`

### How to reset test data

If you want to just reset the test data, for example if tests have failed and you are concerned that the test data may not be stable, you can do this independently by running `npm run db-reset-test-data`. This process is complete when the following messages are returned:

```text
The test data clear up was successful
The test data is loaded and ready to use
```

**IMPORTANT NOTE** - both these processes clear test data using the assumption that this is prefixed with `test-`. You should therefore avoid loading any sample or real data with this prefix.

### How to (hard) reset Database

The easiest way to "start over" and reset the database is to drop the schema and re-run the migrations files.

From your workstation:

```bash
npm run db-drop-create-schema
npm run migrate:latest
npm run seed:run
npm run db-reset-test-data
```

### How to upgrade to new Postgres major version

To upgrade between major versions of Postgres, ie. from 13 -> 14, you will have to use a command like [pg_upgrade](https://www.postgresql.org/docs/current/pgupgrade.html) or `pg_dumpall`. If you want to preserve the data from your current database, you can follow [this guide](https://thomasbandt.com/postgres-docker-major-version-upgrade).

If you don't care about preserving the data, then you can simply follow the below steps.

1. stop the docker compose stack
1. delete the `storage` folder
1. Update the version number in the docker-compose file
1. start the docker compose stack again

## How to add db change (migration)

To add a change to the existing database schema, ie. a new table, column, etc you must first create a new db migration using knex. The main point to keep in mind is that each migration file is an incremental change to the schema. This allows someone to re-build the database by running all migration files in the correct (timestamp) order.

Run the command:  `npm run migrate:make logical_name`. This will create a new file using the name _logical_name_ prefixed by a timestamp. This ensures the migration files are run in order. Do not change the filename once committed as this is what knexjs uses internally to keep track of what has already been applied to a running database.

After completing the the file you can then apply the change with the command:  `npm run migrate:latest`. If you want to rollback you can run:  `npm run migrate:rollback`.

**NOTE**: The functions defined in the initial files (initial_tables and initial_joins) are using the schema name `usher` in the `.raw` function.
If at a point in the future we decide to not hard-code the schema name we can instead
start using the `.withSchema(schemaName)` function to make this even more portable.

## CI / CD Process

The real benefit of a migrations framework like knexjs is the ability to deploy incremental database schema changes. This should be done as part of the CI Application Deploy Process. One of the stages of deploying the application (prior to code deploy) should be a call to `npm run migrate:latest`
