#!/bin/sh
set -e

# This script prepares db for development environment
# and starts Usher server in inspection mode for development environment
ENVFILE=./.env

# Install npm 7
npm install --global npm

echo '> Preparing database for development...'
cd /app/database

echo '> Prepare .env file for database...'
if [ -f "$ENVFILE" ]; then
  echo "/app/database/.env already exists!"
else
  cp ./.env.sample $ENVFILE
  echo "Created /app/database/.env from .env.sample"
fi

echo '> Installing npm packages...'
npm i

echo '> Creating schema and seeding the db...'
npm run db-create-schema-if-not-exists
npm run migrate:latest
npm run seed:run
npm run db-reset-test-data
echo '\n >>> Successfully initilized the database for development! <<< \n'


echo '> Preparing server for development...'
cd /app/server

echo '> Prepare .env file for server...'
if [ -f "$ENVFILE" ]; then
  echo "/app/server/.env already exists!"
else
  cp ./.env.sample $ENVFILE
  echo "Created /app/server/.env from .env.sample"
fi

echo '> Installing npm packages...'
npm i

echo '> Starting nodemon in inspection mode...'
npm run debug
