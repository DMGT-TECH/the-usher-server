curl -X POST -H "Content-Type: application/json" -d '{
 "client_id": "thisIsMyClientID",
  "client_secret": "123456xyzw",
   "audience": "https://us-central1-dmgt-oocto.cloudfunctions.net/the-usher",
    "scope": "openid email read:email",
     "username": "test-user1@dmgtoocto.com",
      "password": "password12345!",
       "grant_type": "http://auth0.com/oauth/grant-type/password-realm",
        "realm": "Username-Password-Authentication"
      }' "http://idp.dmgt.com.mock.localhost:3002/oauth/token"
