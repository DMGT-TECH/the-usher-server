#!/bin/sh
set -e

# Install npm 7
npm install --global npm

echo '> Starting mock identity provider...'
cd /app/mockidentityprovider

echo '> Installing npm packages...'
npm i

echo '> Starting nodemon in inspection mode...'
npm run start
