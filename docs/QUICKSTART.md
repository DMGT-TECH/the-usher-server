# The Usher "Test-Drive" Quickstart

**Audience** This quickstart is intended for newcomers to The Usher.  It is for anyone who wants to understand how to use The Usher, whether an architect, an app developer needing authorization, or someone who wants to contribute to The Usher.

## Setting Up

If you have Docker (and Docker Compose), it is fairly easy to take The Usher for a test drive.  Here's how you set up The Usher from the latest source code:

```sh
git clone https://github.com/DMGT-TECH/the-usher
cd the-usher
docker-compose up
```

Done. This will launch three containers: The Usher server, its database, and a mock identity server.  All three are accessible via port forwarding on your local machine.

## The Test Drive

The next step is to get a token from an identity provider to use with The Usher.  For short, we refer to this as an IdP Token.

The Usher ships with a mock identity provider that simulates Auth0's API endpoint (`/oauth/token`) and issues IdP tokens for a few hardcoded users with username and password authentication (these users are the ones in the test seed data for The Usher's database). We have provided a script to obtain a token from the mock identity server:

```sh
./server/scripts/get_jwt_for_test_tenant.sh | json_pp
```

```json
{
   "access_token" : "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UVkVOVUV5TkVZelJrWkZNekpDTURrek5UZzJSRGRGUWpSQ05rWTROemhFUkRaR00wSTFNdyJ9.eyJpc3MiOiJodHRwczovL2RtZ3QtdGVzdC5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NWU0NzJiMmQ4YTQwOWUwZTYyMDI2ODU2IiwiYXVkIjpbImh0dHBzOi8vdXMtY2VudHJhbDEtZG1ndC1vb2N0by5jbG91ZGZ1bmN0aW9ucy5uZXQvdGhlLXVzaGVyIiwiaHR0cHM6Ly9kbWd0LXRlc3QuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTYxODk1Njc5MiwiZXhwIjoxNjE5MDQzMTkyLCJhenAiOiJTWHZLN3ByUGtSUER5RWxFQ0xPMXJ6TEJLUTNiaE11ciIsInNjb3BlIjoib3BlbmlkIGVtYWlsIiwiZ3R5IjoicGFzc3dvcmQifQ.tGGVnuYGv33G-tov581SUSpt-rDDLNYLhS7Olyp6g6cXnuvg-BWco5csy7MsY_SMhMIM5MslK5PN7n42CPZpSbSb-kcb-QqOXCAdkuNDchXrw-8gtnno7fhvWX8rmV8O4yCbfFyi0giTUJHKzEJozp6IQbKOqRSX38rOic7enKnuPueJ9-Ate78p02qT3EH06tjHtBk7xzgokwPf-EZyDsO9Phk_MJiEAalE-S0a4_ymbAt0-HVn78TpOD5gisGDBWmOXGE557Gs1d2DSB8IW5wP-YLv-StR9AdS1SKf24nPcw76FD_1CxN02zqR3nDAvHtnICcKcVvnpug1mFP61A",
   "expires_in" : 86400,
   "id_token" : "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UVkVOVUV5TkVZelJrWkZNekpDTURrek5UZzJSRGRGUWpSQ05rWTROemhFUkRaR00wSTFNdyJ9.eyJlbWFpbCI6InRlc3QtdXNlcjFAZG1ndG9vY3RvLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiaXNzIjoiaHR0cHM6Ly9kbWd0LXRlc3QuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVlNDcyYjJkOGE0MDllMGU2MjAyNjg1NiIsImF1ZCI6IlNYdks3cHJQa1JQRHlFbEVDTE8xcnpMQktRM2JoTXVyIiwiaWF0IjoxNjE4OTU2NzkyLCJleHAiOjE2MTg5OTI3OTJ9.ayecXkRqmq8Llb-Lm_BOKuUk9t0Ovcdacx8ojUB7EC_oNlh6fhIrMTnb6yfkGC4v1CRJmZ-WhiTKvlC5GzWI8Fl6xV_iCX6KrdhuaDyHLA5aHH_1VEGbluzpW39LIpxOkQi1aT6X9LX625-6lO20GKxNnVxTzryCbfUPhcfX0_Uo8zEU-mKycu3ujFB3_D6lQ5Rh1NLHQeFlY1NfUAVqzAVsoHA8xaGAro7gKIq19QPXgj1lvPKDbOMN2z_uK9pTLcd_loxoUP0GiJnplPNOx_9YRbq8Uk69XDacYsZoz58pDLIG59LeBC7UVqECOP97ChGgIHiqZVkqddcKt3feMQ",
   "scope" : "openid email",
   "token_type" : "Bearer"
}
```

Let's keep a copy of an access token using jq to grab it from the JSON output:

```sh
export IDP_TOKEN=`./server/scripts/get_jwt_for_test_tenant.sh | jq --raw-output .access_token`
```

Now let's use the IdP token to get an access token from The Usher:

```sh
curl -X POST "http://localhost:3001/self/token" -H "Content-type: application/json" -H "Authorization: Bearer $IDP_TOKEN"  -H "client_id: test-client1" | json_pp
```

```json
{
   "access_token" : "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIwMjEtMDQtMTlUMTg6NDk6MTkuMzM2KzAwOjAwIn0.eyJpc3MiOiIkU0VSVkVSX1VSTCIsInN1YiI6ImF1dGgwfDVlNDcyYjJkOGE0MDllMGU2MjAyNjg1NiIsImF6cCI6InRlc3QtY2xpZW50MSIsInJvbGVzIjoidGVzdC1jbGllbnQxOnRlc3Qtcm9sZTEgdGVzdC1jbGllbnQxOnRlc3Qtcm9sZTIgIiwic2NvcGUiOiJ0ZXN0LXBlcm1pc3Npb24xIHRlc3QtcGVybWlzc2lvbjIgdGVzdC1wZXJtaXNzaW9uMyB0ZXN0LXBlcm1pc3Npb240IHRlc3QtcGVybWlzc2lvbjgiLCJleHAiOjE2MTg5NjA2MjEsImlhdCI6MTYxODk1NzAyMX0.XhkKZKF9ob23NcRwYUFd40DoSPMPu9r_ka_fM3boaAqp3i6J74oISjUN8ygWlMbYSZXXjdmvLsfyhbRIqBGO_oFTfiiJYSwVI7peGwDC-rsi6R3mapdMXDWwVsU5omtG4DO_k5TOS1jvQXKQSfXj-D2bNpDzYm0x121TXfE4ZLW1rf2TCNO29Smbm-BBp8xckvp8hq3-XrQG_BeRm2-EnpX5boYnQgHGad7mfjU1gAELx1ryiEwv5-9DgUgkEzAXQuFzGb0_7dob8WMLzsKVdORDj-Rm76mQHVO4OVbIPhn_R0xMXgUaZW80ksTdKagh01y-Y-hWdW62DRRFglyv6A",
   "expires_in" : 3600,
   "refresh_token" : "f697eabc-2d9d-47af-afc0-b186a83a983a",
   "token_type" : "Bearer"
}
```

Pasting The Usher token into <https://jwt.io> decodes it:

```json
{
  "iss": "$SERVER_URL",
  "sub": "auth0|5e472b2d8a409e0e62026856",
  "azp": "test-client1",
  "roles": "test-client1:test-role1 test-client1:test-role2 ",
  "scope": "test-permission1 test-permission2 test-permission3 test-permission4 test-permission8",
  "exp": 1618960621,
  "iat": 1618957021
}
```

You can use the IdP token to access other endpoints on The Usher, like this one that gets the list of permissions your persona has:

```sh
curl -X GET "http://localhost:3001/self/permissions" -H "Content-type: application/json" -H "Authorization: Bearer $IDP_TOKEN"  -H "client_id: test-client1" | json_pp
```

```json
{
   "permission" : [
      "test-permission1",
      "test-permission2",
      "test-permission3",
      "test-permission4"
   ]
}
```

## Changing the Configuration

Notice from the decoded token above, The Usher's server name is not configured and comes through as `$SERVER_URL`. The Usher will auto-configure on a cloud service like Azure/GCP/AWS but not when running locally using Docker Compose.

Here's how to configure it manually:

1. Take down the server using Ctrl-C or docker-compose down.
1. List your docker containers with docker ps -a  and delete them docker rm ######

   ```sh
   docker ps -a
   CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS                       PORTS     NAMES
   10e296df9910   node:12.18.2-alpine    "sh /app/scripts/run…"   12 minutes ago   Exited (137) 5 seconds ago             the-usher_usher-server_1
   6b42f056d30e   postgres:12.1-alpine   "docker-entrypoint.s…"   12 minutes ago   Exited (0) 4 seconds ago               the-usher_db_1
   $ docker rm  10e296df9910  6b42f056d30e
   10e296df9910
   6b42f056d30e
   ```

1. Copy server/.env.sample to server/.env
1. Add a line to configure the server url equal to your desired issuer:  `PRESET_SERVER_URL=http://dmgt-oocto.com`
1. docker-compose up

Note you could ssh into the docker container using `docker exec -it [usher-server-Container-Id] sh` , edit the configuration, and re-launch it.

After The Usher comes back up, call `POST /self/token` again, and you'll find that the issued tokens now have the desired iss claim.

```sh
curl -X POST "http://localhost:3001/self/token" -H "Content-type: application/json" -H "Authorization: Bearer $IDP_TOKEN"  -H "client_id: test-client1" | json_pp
```

```json
{
   "access_token" : "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIwMjEtMDQtMTlUMTg6NDk6MTkuMzM2KzAwOjAwIn0.eyJpc3MiOiJodHRwOi8vZG1ndC1vb2N0by5jb20iLCJzdWIiOiJhdXRoMHw1ZTQ3MmIyZDhhNDA5ZTBlNjIwMjY4NTYiLCJhenAiOiJ0ZXN0LWNsaWVudDEiLCJyb2xlcyI6InRlc3QtY2xpZW50MTp0ZXN0LXJvbGUxIHRlc3QtY2xpZW50MTp0ZXN0LXJvbGUyICIsInNjb3BlIjoidGVzdC1wZXJtaXNzaW9uMSB0ZXN0LXBlcm1pc3Npb24yIHRlc3QtcGVybWlzc2lvbjMgdGVzdC1wZXJtaXNzaW9uNCB0ZXN0LXBlcm1pc3Npb244IiwiZXhwIjoxNjE4OTYyNDQzLCJpYXQiOjE2MTg5NTg4NDN9.t7m9KtbakZxrWD4ALuVk0UgmQuYv2SGgx8H9SyFsxX7fjAXvQMOJ7P91BUjNLYPGnBG5TCmO2oaC3PqNGiRDLMfKzUa0S9lrepdkf6zFTlL93ScEnFaxrJuKty3UVyk-iDP_2CC46gxu6ihIr28zDu73TawQQjzr1UT4LYhNOK9Zq7tGDHE8WZPuXitbzr4WlhxiXEXxr1D8R6FS6unpp0xCsOl-XKaRMUAVwERk5S3Cub1FFFKJrKJ22PwD4Uss8lQN0WyHlJ6zWlPvDf3TieNVlm1wsxaPTYDbEbbS6CKYMRotC0xRE0xbaggZ-wBEJWzH78ub5TyGMjhdG1FZ2Q",
   "expires_in" : 3600,
   "refresh_token" : "629fa7a8-3d73-4143-99ef-b7cf8bfd3291",
   "token_type" : "Bearer"
}
```

where the access token now happily decodes to:

```json
{
  "iss": "http://dmgt-oocto.com",
  "sub": "auth0|5e472b2d8a409e0e62026856",
  "azp": "test-client1",
  "roles": "test-client1:test-role1 test-client1:test-role2 ",
  "scope": "test-permission1 test-permission2 test-permission3 test-permission4 test-permission8",
  "exp": 1618962443,
  "iat": 1618958843
}
```

Thus ends your first test drive of The Usher.  Please see the OpenAPI Spec for more endpoints to try, or deploy The Usher to a cloud service for use in your development.
