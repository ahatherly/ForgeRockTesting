## Create and configure a Realm and Client ##

- Click create realm
- Give it a name "test"
- Click create
- Add a client:
	- Click Applications > Oauth2
	- Click Add Client
	- Set a clientid: 860700880739.apps.hackathon
	- Set a secret: 862c1b29-d075-4da5-b6d9-3089140e04bd
	- Set a redirect URI: http://localhost:8080/strategicauthclient/redirect
	- Set 5 scopes (press tab after entering each one): profile user/Medication.read user/Medication.write user/Patient.read user/Patient.write
	- Click create
- Go back into the OAuth2 provider settings
	- Turn the "Use Stateless Access & Refresh Tokens" to ON
- Add another client for Postman testing:
	- Click Add Client
	- Set a clientid: 087718952371.apps.hackathon
	- Set a secret: 99990f8e-dc68-47d7-89aa-bf0f8b31ef79
	- Set a redirect URI: https://www.getpostman.com/oauth2/callback
	- Set 5 scopes (press tab after entering each one): profile user/Medication.read user/Medication.write user/Patient.read user/Patient.write
	- Click create
- Add a service:
	- Services > Add a Service > Oauth2 Provider
	- Scopes (press tab after entering each one): profile user/Medication.read user/Medication.write user/Patient.read user/Patient.write
	- Click Create
- Create a user:
	- Click Identities
	- Click Add Identity
	- Create some test users with passwords:
		- 912345000001 / password123 (Enter a firstname and lastname)
		- 912345000002 / password123 (Enter a firstname and lastname)
		- 912345000003 / password123 (Enter a firstname and lastname)

## Test using Postman

- Open postman and create a new request
- Click the "Authorization" tab
- Select OAuth 2.0 from the type dropdown
- Click "Get New Access Token"
	- Token name: OpenAMAccessToken
	- Grant type: Authorization Code
	- Redirection URI: https://www.getpostman.com/oauth2/callback
	- Auth URL: http://localhost:8081/openam/oauth2/realms/test/authorize
	- Access Token URL: http://localhost:8081/openam/oauth2/realms/test/access_token
	- Client ID: 087718952371.apps.hackathon
	- Client Secret: 99990f8e-dc68-47d7-89aa-bf0f8b31ef79
	- Scope: profile
	- State: Any random value
	- Client Authentication: Send as Basic Auth header
- Click "Request Token"
- Enter a username and password: 912345000001 / password123
- Click allow for the profile scope consent
- You should now see the JWT content - you can copy/paste that into https://jwt.io to see the token contents


## Test using an OpenID Connect client

- Note: Any OAuth client should work - I tested using a Java test client available here: https://github.com/ahatherly/OpenIDConnect-TestClient-Java
- Make sure you configure the correct settings in the client:
	- Clientid: 860700880739.apps.hackathon
	- Secret: 862c1b29-d075-4da5-b6d9-3089140e04bd
	- Redirect URI: http://localhost:8080/strategicauthclient/redirect
	- Authorisation endpoint: http://localhost:8081/openam/oauth2/realms/test/authorize
	- Token endpoint: http://localhost:8081/openam/oauth2/realms/test/access_token

