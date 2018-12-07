# Configure Scope-based User Authorisation

- The scenario we will test is this:
	- We have three users (set up previously with IDs 912345000001, 912345000002, 912345000003)
	- We will use scopes in the form described in the [SMART on FHIR standard](http://hl7.org/fhir/smart-app-launch/scopes-and-launch-context/index.html)
	- The first user (912345000001) is a clinician who should be able to read and write both Patient and Medication resources
	- The second user (912345000002) is an administrative user, who should only be able to read and write Patient resources and not Medication resources
	- The third user (912345000003) is an audit user, who should be able to read both resource types, but not write them

## Create a Policy Script

- Open the OpenAM console and select the test realm
- Now, let's create a simple javascript script to make the actual policy decisions for specific scopes:
	- Click Scripts
	- Click New
		- Name: SMART on FHIR Sample Scope Policies Script
		- Type: Policy Condition
		- Click Create
		- You can now create a javascript script to apply your authorisation decisions based on information from the request, and other information from the user's profile. Details of the objects available to this script can be found [here](https://backstage.forgerock.com/docs/am/6/authorization-guide/#scripting-api-policy)
		- You can paste the sample script from [here](SMARTonFHIRSampleScopePolicyScript.js) to test, which applies our test user conditions (above).
	- To aid in debugging your custom scripts, you can enable logging:
		- Go to the Debug page in openam: http://localhost:8081/openam/Debug.jsp (NOTE: there is no link to this in the console!)
		- Select "Entitlement" in the "Debug Instances" drop-down, and "Message" in Level drop-down beside it, then Submit, and Confirm

## Configure an OAuth2 Authorization Policy

- Before we configure our policies, we need to tell the OAuth service to use OpenAM's policies for scopes:
	- Click Services, OAuth2 Provider
	- Switch "Use Policy Engine for Scope decisions" to ON
	- Click Save Changes
- Now, expand the Authorisation section from the left menu
- Configure the policies for your OAuth2 scopes:
	- Click Policy Sets
	- Click Default OAuth2 Scopes Policy Set
	- Click Add a Policy:
		- Name: SMART on FHIR Clinical Scopes
		- Resource Type: OAuth2 Scope
		- Resources: *
		- In the next box that appears, type: Medication.read, then click Add
		- Click Add Resource
		- Repeat the previous three steps three times, speciying the other scopes (Medication.write, Patient.read and Patient.write)
		- Click create
	- Configure your new policy
		- Note: The Web UI for this part is a bit picky, so please follow the below steps carefully!
		- Click the Actions tab
		- Click Add an Action, and choose Grant
		- Ensure Allow is selected
		- Click Save Changes
		- Click the Subjects tab
		- Click the small pencil icon to edit the default rule
		- Select Authenticated Users from the drop-down
		- Click the small tick icon to save your updates
		- Click save changes
		- Click the Environments tab
		- Click Add an Environment Condition
		- Select Script from the type dropdown
		- Select your SMART on FHIR Sample Scope Policies Script
		- Click the small tick icon to save your updates
		- Click save changes
		- You can click the Summary tab to review your policy settings

## Set up a second policy to explicitly deny scopes

- The default behaviour when OpenAM applies policies for grant/deny scopes is:
	- If the policy grants the scope, the user gets the scope in their token
	- If the policy denies the scope, openam will request consent from the user, and if the user consents, the scope is then granted
- This is not the behaviour we want - we never want to ask the user for their consent for these scopes, we want to simply grant or deny based on the policy alone.
- To do this, we need to create a second policy which explicitly denies the scope, so the user isn't prompted for consent:
	- Click Policy Sets
	- Click Default OAuth2 Scopes Policy Set
	- Click Add a Policy:
		- Name: Deny Policy
		- Resource Type: OAuth2 Scope
		- Resources: *
		- In the next box that appears, type: Medication.read, then click Add
		- Click Add Resource
		- Repeat the previous three steps three times, speciying the other scopes (Medication.write, Patient.read and Patient.write)
		- Click create
	- Configure your new policy
		- Click the Actions tab
		- Click Add an Action, and choose Grant
		- Ensure Deny is selected
		- Click Save Changes
		- Click the Subjects tab
		- Click the small pencil icon to edit the default rule
		- Select Authenticated Users from the drop-down
		- Click the small tick icon to save your updates
		- Click save changes
		- Click the Environments tab
		- Change the drop down from "All of..." to "Not..."
		- Click Add an Condition Environment
		- Select Script from the type dropdown
		- Select your SMART on FHIR Sample Scope Policies Script
		- Click the small tick icon to save your updates
		- Click save changes
		- You can click the Summary tab to review your policy settings

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
	- Scope: Medication.read
	- State: Any random value
	- Client Authentication: Send as Basic Auth header
- Click "Request Token"
- Enter a username and password: 912345000001 / password123
- You should now see the JWT content, and you can see that the Medication.read scope was allowed.
- You can now re-test using the second user account (the administrative user), which should not be allowed that scope.
- To clear your login session and allow you to log in again in Postman, click the "Cookies" link near the top right of the screen, and delete the two cookies created by openam
- When all requested scopes are denied, openam will return an error response rather than a token, so you will see that as an error response in Postman

