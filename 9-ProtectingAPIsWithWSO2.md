# Protecting APIs with WSO2 API Manager using OpenAM identities

- Previously, we looked at how to control access to WSO2's web portals (e.g. the "API store") for developers wanting to browse APIs in the store.
- Once a developer has created some software to call an API, that API is likely to need to verify the user involved in the call is valid and is authorised to access the resources they are requesting. In our example, this would be the member of staff and associated scopes we [looked at earlier](5-ScopeBasedUserAuthZ.md).
- So, we previously configured the scope-based authorisation rules, but how do we get WSO2's API gateway to enforce access controls based on the access tokens and scopes we configured?

## Configure OpenAM

- Ideally, we don't want WSO2 to have to call back to OpenAM every time it needs to verify an access token. To avoid this, we can configure OpenAM to return "stateless" access tokens (also known as "self-contained" or "client-based" tokens) in JWT format:
	- Log into the realm you want to use in OpenAM
	- Click Services > OAuth2 Provider
	- Switch the "Use Client-Based Access & Refresh Tokens" to On.
	- Click Save Changes
- Now, when OpenAM gives out access tokens, they will be signed JSON web tokens, containing details of the user, system, and scopes granted.
- Clients can verify the JWT tokens by checking the signature part of the token. To make this work with WSO2, we need to alter the signing algorithm to RS256:
	- In the same OAuth2 Provider page, click the Advanced Tab
	- In the OAuth2 Token Signing Algorithm field, change the algorithm from HS256 to RS256 (WSO2 doesn't seem to support HS256)
	- Click Save Changes
- Use an OpenID Connect client to request authorisation, and take a copy of the token you get back. You can paste the token into https://jwt.io/ to see the decoded version of the token. You will use some of the values in this token for the steps below.

## Configure WSO2 Identity Provider Entry

- The below is based on [this article](http://soatutorials.blogspot.com/2018/06/how-to-protect-your-apis-with-self.html?m=1)
- In order for WSO2 to be able to verify the tokens issued by OpenAM in API calls it is brokering, you need to configure an Identity Provider entry:
	- Open the Carbon console and log in as an admin user
	- In the menu on the left, under "Identity Providers" click "Add"
	- The name field must match the "iss" claim in your access token. By default this will be a URL for your OpenAM realm.
	- In the Home Realm Identifier, enter the OpenAM realm name
	- In the IDP certificate type, select "Use IDP JWKS endpoint"
	- Enter the JWKS URL for your realm into the "Identity Provider's JWKS Endpoint" box
		- NOTE: You can find this (and all other relevant OpenAM URLs) from the OpenID Connect discovery endpoint for your OpenAM realm: http://localhost/openam/oauth2/realms/[realm name]/.well-known/openid-configuration
	- The alias field should be set to the value of the "aud" claim in your token. This will be the client id for the OAuth2 client in OpenAM that you used to request the token.
	- You don't need to configure anything else - this won't act as an actual identity provider, it just contains the configuration WSO2 needs to verify the OpenAM-issued tokens it receives in API calls.
	- Click "Register" to save your IDP entry.

## Create an API in the WSO2 publisher

- Now you can create a WSO2 API definition using the publisher:
	- Open the publisher (https://localhost:9443/publisher/)
	- Log in
	- Click "Add a new API"
	- Configure all the details of your API, backend URLs, etc. without security initially to ensure you've configured it correctly.
	- Ensure you have set the "Auth type" for each method to "None".
	- Once configured, click the "Open in the API Store" button to open the API in the store
	- Click "API Console", expand an API method section
	- Click the "try me" button, enter any required parameters, and click "Execute" to test your API
	- If it doesn't work, you'll need to correct your API definition in the publisher before continuing.
- Update the API definition to require user authentication for the API call:
	- Go back into the publisher, and edit your API definition
	- In the "Manage" tab, scroll to the resources section at the bottom
	- Change the "Auth Type" to "Application & Application User" to enable security for the API.
- Now create an Application entry and subscribe to the test API:
	- Go into the API store, and create a new "Application"
	- Give the application a name, and use the OAuth token type
	- Go to the Production Keys tab, and Generate a key for your application
	- The only grant type you will need is the "JWT" grant, so you can untick the other grant types and click Update
	- Click the Show Keys button, and make a note of your Consumer Key and Consumer Secret
	- Go to the API you want to test, and subscribe your application to the API
- Now, we can test the API:
	- First, request an access token from OpenAM (as per [previous instructions](5-ScopeBasedUserAuthZ.md)).
	- This will return an access token in base64 encoded format. You can chech the contents by pasting it into https://jwt.io/

