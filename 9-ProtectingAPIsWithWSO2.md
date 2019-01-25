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

## Configure WSO2 to also use stateless tokens

- Because WSO2 will also be issuing tokens for actual API calls for registered applications, we can configure WSO2 to also use stateless tokens:
	- See: https://docs.wso2.com/display/IS540/Self-contained+Access+Tokens
	- Edit the config file on the WSO2 server in the path: <IS_HOME>/repository/conf/identity/identity.xml
	- Edit the IdentityOAuthTokenGenerator line to be ```<IdentityOAuthTokenGenerator>org.wso2.carbon.identity.oauth2.token.JWTTokenIssuer</IdentityOAuthTokenGenerator>```
	- Also, edit the SkipUserConsent line to be ```<SkipUserConsent>true</SkipUserConsent>``` to avoid the user being asked to consent to any scopes we might request.
	- You'll need to restart WSO2 API Manager for this to take effect

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
	- Test the API again from the store - this time you should get an error because you don't have authorisation for the API call.

## Test the API through the WSO2 gateway using access tokens from OpenAM

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
	- Now, we need to use this token to request authorisation with the WSO2 gateway for our "Application" entry created above
		- This allows WSO2 to apply any additional application-specific policies and controls to the API call such as throttling and rate limiting
	- To do this, we need to use our access token as an assertion into WSO2 to request a new token for the API call
		- See [this page](https://tools.ietf.org/html/rfc7523#page-5) for details of this OAuth grant type
	- In effect, this allows WSO2 to verify the token from OpenAM, and use it as authentication of the calling user, and respond by issuing it's own token for the API call.
	- To do this, we use the "Consumer Key" and "Consumer Secret" for our application, along with the Access token we for from OpenAM and pass it to the WSO2 gateway OAuth endpoint.
- You can test this in cURL:

```
curl -i -X POST -u [*CONSUMER_KEY*]:[*CONSUMER_SECRET*] -k -d 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=[*JWT_ACCESS_TOKEN*]' -H 'Content-Type: application/x-www-form-urlencoded' https://172.20.0.4:8243/token
```

- So, a real call might look like this:

```
curl -i -X POST -u JFfiYp5AiJ6mQenBTSYsl43o8Tga:OVhCJavRAxwI5X3ocQdVNJn8qqca -k -d 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=eyJ0eXAiOiJKV1QiLCJ6aXAiOiJOT05FIiwia2lkIjoid1UzaWZJSWFMT1VBUmVSQi9GRzZlTTFQMVFNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkb2N0b3IxIiwiY3RzIjoiT0FVVEgyX1NUQVRFTEVTU19HUkFOVCIsImF1dGhfbGV2ZWwiOjAsImF1ZGl0VHJhY2tpbmdJZCI6ImYwMzIxM2Q4LWU5YzgtNDNiMC04Mzk3LTA4NDA3YjNhMGRkMi02NzA5NjYiLCJpc3MiOiJodHRwOi8vbmhzaWRlbnRpdHkuYXBpLXBvcnRhbC5kaWdpdGFsLm5ocy51azo4MC9vcGVuYW0vb2F1dGgyL3JlYWxtcy9yb290L3JlYWxtcy9zdGFmZi1pZGVudGl0aWVzIiwidG9rZW5OYW1lIjoiYWNjZXNzX3Rva2VuIiwidG9rZW5fdHlwZSI6IkJlYXJlciIsImF1dGhHcmFudElkIjoiaVZLVnFBVU5UWkVLRmJlYktJdWV3X0lrQnJBIiwiYXVkIjoiYXBpLXRlc3QtY2xpZW50IiwibmJmIjoxNTQ4NDE5NjgzLCJncmFudF90eXBlIjoiYXV0aG9yaXphdGlvbl9jb2RlIiwic2NvcGUiOlsiZGVtb2dyYXBoaWNzIl0sImF1dGhfdGltZSI6MTU0ODQxOTY3OSwicmVhbG0iOiIvc3RhZmYtaWRlbnRpdGllcyIsImV4cCI6MTU0ODQ1NTY4MywiaWF0IjoxNTQ4NDE5NjgzLCJleHBpcmVzX2luIjozNjAwMCwianRpIjoiMFhvRFZpT2ZCazBlQ091UXltbERZamxGSXBBIn0.e3Kq0IOt6pNMo0jafdgchszoeijtVCd7pCF0SX8YT5cvv9m8S6OGnugsi2kAAghEmukvBciDvbR1yidf0gk9cpyNoA0sS3-aMzusUkHuhX7CI4eIwWnFASTryvrel6qFW2IGSU6HDkczoUELbEZNLrscCEuw-X-4-l-t1udBzZmI0mi_kdLXCqooBtgOAt3u-GscNomkO-aCXsRz2R-lh_wycQg6rNochBzPXFO4_1DFFSziArQoF67K6lvf_AV-uCtv0rkieHYNZmK9TuLDS0SFbxelxa0-GknP-1A-8YHKAuHnpsx_jKkXh4kSxjBpRSiLY-XdlZVCSk11TqyAcg' -H 'Content-Type: application/x-www-form-urlencoded' https://172.20.0.4:8243/token
```

- If WSO2 is able to verify the JWT, it will issue it's own access token which you can use in the API call into WSO2 itself. The result will look something like this:

```
HTTP/1.1 100 Continue

HTTP/1.1 200 OK
X-Frame-Options: DENY
Cache-Control: no-store
X-Content-Type-Options: nosniff
Pragma: no-cache
X-XSS-Protection: 1; mode=block
Content-Type: application/json
Date: Fri, 25 Jan 2019 12:35:11 GMT
Transfer-Encoding: chunked

{"access_token":"eyJ4NXQiOiJOVEF4Wm1NeE5ETXlaRGczTVRVMVpHTTBNekV6T0RKaFpXSTRORE5sWkRVMU9HRmtOakZpTVEiLCJraWQiOiJOVEF4Wm1NeE5ETXlaRGczTVRVMVpHTTBNekV6T0RKaFpXSTRORE5sWkRVMU9HRmtOakZpTVEiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJkb2N0b3IxIiwiYXVkIjoiSkZmaVlwNUFpSjZtUWVuQlRTWXNsNDNvOFRnYSIsIm5iZiI6MTU0ODQxOTcwMywiYXpwIjoiSkZmaVlwNUFpSjZtUWVuQlRTWXNsNDNvOFRnYSIsInNjb3BlIjoiZGVmYXVsdCIsImlzcyI6Imh0dHBzOlwvXC9sb2NhbGhvc3Q6OTQ0M1wvb2F1dGgyXC90b2tlbiIsImV4cCI6MTU0ODQyMzMwMywiaWF0IjoxNTQ4NDE5NzAzLCJqdGkiOiI0N2RkZTE1YS04OGUxLTQ3ZTctODJhNy1iYjZlMDQxYmJlNjAifQ.R0o_K3F88PoKq_q6ULFuOROsbDwigWNO6ayxNmFm15y4OwHjUWTF9-cSvlUXz74rniDhdDeCLtQGYnfo-tjC3IQGE20KkLnrrbsLZaaVrPjiZQUN1BFUDG5DJzCIcPxMl70lS00frVqQX_SL66AlveBd0B-WleOHBE1we9IqInXOyW4pAiz0RPliVaNa0au0Xwt7gfVFlZJlm3IKCmAp3W-QA4_79CXSCrf9g2-U1DLEf7Lc7yTg70pJ7G8mL6esBGvpfSKJO0xQx024U3IGwGreS0E4y8oLkd-yYBpGirThmpoKGDfuU61a3AhepPrOYCNAytRUNpkJJ5JMHlr-3w","refresh_token":"ab5efbe3-39e4-3043-81ce-bc4e3d4e4dfb","scope":"default","token_type":"Bearer","expires_in":3600}
```

- Take a copy of the access token value from the above, and this is the value you will use in your API call:
	- Open the API store, and go to your API
	- Click "API Console" and paste your token value into the "Authorisation : Bearer" box
	- Expand an API method section and click the "try me" button
	- Enter any required parameters, and click "Execute" to test your API
	- If it all worked correctly, your API call should now execute!

## Next - Limiting access based on specific scopes

- Now, we need to configure the API to require specific scopes to be present in these tokens to gain access to resources.
- ......COMING SOON......

