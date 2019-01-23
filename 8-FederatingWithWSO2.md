# Federating with WSO2 API Manager / Identity Manager

- In order to consume and work with identities managed in OpenAM in the WSO2 API Management product, we can federate the identites into the WSO2 user store using OpenID Connect. This will allow us to use identities from OpenAM to access the WSO2 API store, or to apply controls to APIs brokered through the WSO2 gateway.

## Configure OpenAM

- First, we need to create an OAuth2 client entry for WSO2 to use to communicate with OpenAM:
	- Log into the realm you want to use in OpenAM
	- Click Applications > OAuth2 > Add Client
	- Set the client id (wso2-federated-idp)
	- Set the client secret (secret123)
	- We'll get the redirect URL from WSO2 later, so come back to that field later...
	- For scopes, add these (pressing tab between each): openid profile email phone address
	- For default scopes, add these (pressing tab between each): openid profile
	- Save the changes, then to the Advanced tab
	- Change the Token Endpoint Authentication Method to client_secret_post
	- Set Implied consent to on
	- Save the changes
- Now we also need to customise the OpenID Connect Claims Script to return additional claims from the userinfo endpoint:
	- Click Scripts
	- Click the "OIDC Claims Script"
	- Edit your script to add some claims for the preferred_username and groups - you can use [this script](OIDC-Claims-Script.txt)
	- Save your script

## Configure WSO2's identity management services

- Now, we need to configure WSO2's identity management service to federate identities from the above OpenAM client into it's own user store.
- First, you will need to install an additional "Feature" into your WSO2 instance (see [here](https://docs.wso2.com/display/ADMIN44x/Working+with+Features) for details).
	- The feature you need is called "OpenID Connect Application Authenticator Server (5.1.8)"
	- If you're installed via a POM, this is the feature you'll want:
		- ID: org.wso2.carbon.identity.application.authenticator.oidc.server.feature.group
		- Version: 5.1.8
- Now we need to create a WSO2 **Identity Provider** entry:
	- First, log into the WSO2 management console (https://172.20.0.4:9443/carbon)
	- After logging in, from the left menu, in the "Identity Providers" section, click "Add"
	- Enter a name (supplier-access)
	- Enter the home realm name from OpenAM (supplier-access)
	- For the IDP certificate, select "Use IDP JWKS endpoint"
	- For the JWKS endpoint, enter the JWKS URL for your realm (http://nhsidentity.api-portal.digital.nhs.uk:80/openam/oauth2/realms/root/realms/supplier-access/connect/jwk_uri)
	- NOTE: You can find this (and all other relevant OpenAM URLs) from the OpenID Connect discovery endpoint for your OpenAM realm: http://localhost/openam/oauth2/realms/[realm name]/.well-known/openid-configuration
	- Leave the Alias as the default value
	- Expand the "Federated Authenticators" section, then the "OAuth2/OpenID Connect Configuration" (if you don't see that section, you haven't installed the feature above correctly).
	- Tick the first two boxes, then enter the details for your realm and client created above in OpenAM:
		- ClientID: wso2-federated-idp
		- Client Secret: secret123
		- Authorisation Endpoint URL: http://nhsidentity.api-portal.digital.nhs.uk/openam/oauth2/realms/supplier-access/authorize
		- Token Endpoint URL: http://nhsidentity.api-portal.digital.nhs.uk/openam/oauth2/realms/supplier-access/access_token
		- Take the Callback URL from here, open a new tab, and go to your OpenAM realm, and add this URL to your OAuth2 client entry
		- Userinfo Endpoint URL: http://nhsidentity.api-portal.digital.nhs.uk/openam/oauth2/realms/supplier-access/userinfo
		- Additional Query Parameters: scope=openid profile email phone address
		- Tick the "Enable HTTP basic auth for client authentication" box
	- Now, expand the "Just-in-time provisioning section
		- Select "Always provision to User Store Domain"
		- Choose "PRIMARY" from the drop-down
		- Select "Provision silently"
	- Click "Update" to save your changes
- Now, we can configure a "Service Provider" entry for the WSO2 store application:
	- From the left menu, in the "Service Providers" section, click "Add"
	- Service provider name: api-store
	- Click Register
	- Expand the Claim Configuration section:
		- Leave the "Use Local Claim Dialect" selected
		- Click "Add Claim URI"
		- From the drop-down, select http://wso2.org/claims/displayName
		- Click "Add Claim URI" again several times, and select the following claims:
			- http://wso2.org/claims/fullname
			- http://wso2.org/claims/emailaddress
			- http://wso2.org/claims/lastname
			- http://wso2.org/claims/givenname
			- http://wso2.org/claims/groups
		- Tick "Mandatory claim" for the first entry (http://wso2.org/claims/displayName)
	- Expand the "Inbound Authentication Configuration" section, and the "OAuth2/OpenID Connect Configuration" subsection
		- Click Configure
		- Leave the "code" grant types ticked, and untick all the others
		- Enter the callback URL for the store app (we will find this later, but you'll need to enter something and correct it later)
		- Leave the rest as defaults and click Update
		- You should now be able to see an oauth client key, and by clicking "show" the associated OAuth client secret. Make a note of these for later.
	- Expand the "Local and Outbound Authentication Configuration" section
		- Select "Federated Authentication"
		- Select the name of your identity provider created above: supplier-access
	- Click Update to save your service provider

## Configure the WSO2 API store to use this identity provider

- Finally, to configure the store to use this WSO2 Identity provider (which in turn federates with OpenAM), we need to edit a configuration file in the WSO2 API store application:
	- Find and edit the store's site.json file:
```
vi /home/wso2carbon/wso2am-2.6.0/repository/deployment/server/jaggeryapps/store/site/conf/site.json
```
	- Take note of the redirectURI in the oidcConfiguration section of this file - go back into the management console, and edit your "Service Provider" entry, setting this value as the "callback URL" for your service provider.
	- Replace the config in the oidcConfiguration section with values for your WSO2 oauth endpoint and service provider configured above (with the exception of the callback URL which you should leave as it is!):
```json
  "oidcConfiguration" : {
    "enabled" : "true",
    "issuer" : "API_STORE",
    "identityProviderURI" : "https://localhost:9443/oauth2/token",
    "authorizationEndpointURI" : "https://localhost:9443/oauth2/authorize",
    "tokenEndpointURI" : "https://localhost:9443/oauth2/token",
    "userInfoURI" : "https://localhost:9443/oauth2/userinfo",
    "jwksURI" : "https://localhost:9443/oauth2/jwks",
    "logoutEndpointURI" : "https://localhost:9443/oauth2/logout",
    "authHttpMethod": "GET",
    "clientConfiguration" : {
      "clientId" : "**TAKE THIS FROM YOUR SERVICE PROVIDER ENTRY AS NOTED EARLIER**",
      "clientSecret" : "**TAKE THIS FROM YOUR SERVICE PROVIDER ENTRY AS NOTED EARLIER**",
      "responseType" : "code",
      "authorizationType" : "authorization_code",
      "scope" : "phone email address openid profile",
      "redirectURI" : "**LEAVE THIS AS WHATEVER IT IS ALREADY IN YOUR CONFIGURATION FILE**",
      "postLogoutRedirectURI" : "https://localhost:9443/store/",
      "clientAlgorithm" : "RS256"
    }
  },
```
	- Save the changes to this file
- Now, when you go to the store (https://localhost:9443/store/) and click the login button, you should be redirected to the OpenAM login page
- After logging in, you may be asked to consent to the scopes requested by WSO2
- After consenting, your user profile information will automatically be replicated into the WSO2 user database, and from there passed into the store application

## Role mapping

- When you test the above in the store, you will get an error at the end of the process, saying that the user is not authorised to access the store - this is because the user hasn't been associated with a role that gives them access to login to the store
- I haven't yet managed to get a role to pass across from OpenAM and map into a role in WSO2
- As a workaround, you can reconfigure the "Internal/Everyone" role in WSO2, to grant that role the "login" permission - that should be sufficient to allow you to login to the API store using the above process.
