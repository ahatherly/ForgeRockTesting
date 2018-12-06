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
	- Set a scope: profile
	- Click create
- Add a service:
	- Oauth2 Provider
	- Scopes: profile
	- Click Create
- Create a user:
	- Click Identities
	- Click Add Identity
	- Create some test users with passwords:
		- 912345000001 / password123
		- 912345000002 / password123
		- 912345000003 / password123

## Test using an OpenID Connect client

- Note: Any OAuth client should work - I tested using a Java test client available here: https://github.com/ahatherly/OpenIDConnect-TestClient-Java
- Make sure you configure the correct settings in the client:
	- Clientid: 860700880739.apps.hackathon
	- Secret: 862c1b29-d075-4da5-b6d9-3089140e04bd
	- Redirect URI: http://localhost:8080/strategicauthclient/redirect
	- Authorisation endpoint: http://localhost:8081/openam/oauth2/realms/test/authorize
	- Token endpoint: http://localhost:8081/openam/oauth2/realms/test/access_token

