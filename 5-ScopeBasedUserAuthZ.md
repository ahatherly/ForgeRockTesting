# Configure Scope-based User Authorisation

- The scenario we will test is this:
	- We have three users (set up previously with IDs 912345000001, 912345000002, 912345000003)
	- We will use scopes in the form described in the SMART on FHIR standard
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

## Change the default behaviour for requesting consent

- The default behaviour when OpenAM applies policies for grant/deny scopes is:
	- If the policy grants the scope, the user gets the scope in their token
	- If the policy denies the scope, openam will request consent from the user, and if the user consents, the scope is then granted
- This is not the behaviour we want - we never want to ask the user for their consent for these scopes, we want to simply grant or deny based on the policy alone.
- To do this, we can override the consent handling to always automatically deny consent for any policies which the user would otherwise be prompted.
- TO BE COMPLETED!!!


