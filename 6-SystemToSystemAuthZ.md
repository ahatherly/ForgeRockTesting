# System-To-System Authorisation

- In this test, we want to try OAuth2 authorisation for system-to-system interactions without any user context.
- We will still use scopes for the authorisation decisions, but simply configure which client can request which scopes.
- Previously we had used the OAuth "Authorisation Code" grant type - for this use-case we will instead use the "Client Credentials" grant type
- To do this, we'll set up two systems (Applications) - one that should be allowed to operate on Patients and one on Medications
- Add our "Medications" client:
	- Click Applications - OAuth 2.0
	- Click Add Client
	- Client ID: MedicationsClient
	- Secret: f8580b42-070c-4683-ae59-3a1b6f10df1b
	- Set a redirect URI: https://www.getpostman.com/oauth2/callback
	- Set 5 scopes (press tab after entering each one): profile user/Medication.read user/Medication.write user/Patient.read user/Patient.write
- Add our "Patient" client:
	- Click Applications - OAuth 2.0
	- Click Add Client
	- Client ID: PatientClient
	- Secret: 4e5d00f3-ada7-408b-a856-1a988f1309f4
	- Set a redirect URI: https://www.getpostman.com/oauth2/callback
	- Set 5 scopes (press tab after entering each one): profile user/Medication.read user/Medication.write user/Patient.read user/Patient.write
- Notes:
	- Because our [Scopes script](SMARTonFHIRSampleScopePolicyScript.js) (see [Scope Based User AuthZ](5-ScopeBasedUserAuthZ.md) for instructions on configuring this script) also validates scopes for systems, you can also use the same clients for user-based authorisation decisions (where a user context is included), and system-based authorisation decisions - there is no need to have separate Application entries for this - I have just done it for clarity in this testing.

## Testing using Postman

- Open postman and create a new request
- Click the "Authorization" tab
- Select OAuth 2.0 from the type dropdown
- Click "Get New Access Token"
	- Token name: OpenAMAccessToken
	- Grant type: Client Credentials
	- Access Token URL: http://localhost:8081/openam/oauth2/realms/test/access_token
	- Client ID: MedicationsClient
	- Client Secret: f8580b42-070c-4683-ae59-3a1b6f10df1b
	- Scope: user/Medication.read
	- Client Authentication: Send as Basic Auth header
- Click "Request Token"
- You should now see the JWT content, and you can see that the user/Medication.read scope was allowed.
- You can now re-test with a Patienr scope, which should return an error as the application isn't allowed that scope
- If you re-test using the PatientClient client ID and secret, you should be granted the Patient scopes but not the Medication scopes

## Testing using cURL

- Because this is such a simple OAuth flow (it is a single HTTP POST request to get a token), you can also very easily test it using cURL:
- Test using the MedicationsClient, requesting all four scopes (only the Medication ones should be granted and come back in the token):
```
curl -i -H 'Content-Type: application/x-www-form-urlencoded' -X POST http://localhost:8081/openam/oauth2/realms/test/access_token -d 'grant_type=client_credentials&client_id=MedicationsClient&client_secret=f8580b42-070c-4683-ae59-3a1b6f10df1b&scope=user%2FMedication.read%20user%2FMedication.write%20user%2FPatient.read%20user%2FPatient.write'
```
- Now test using the PatientClient, requesting all four scopes (only the Patient ones should be granted and come back in the token):
```
curl -i -H 'Content-Type: application/x-www-form-urlencoded' -X POST http://localhost:8081/openam/oauth2/realms/test/access_token -d 'grant_type=client_credentials&client_id=PatientClient&client_secret=4e5d00f3-ada7-408b-a856-1a988f1309f4&scope=user%2FMedication.read%20user%2FMedication.write%20user%2FPatient.read%20user%2FPatient.write'
```

## Sample Access token content

- Taking the first cURL example above, the decoded JWT which is returned looks like this:

```json
{
  "sub": "MedicationsClient",
  "cts": "OAUTH2_STATELESS_GRANT",
  "auditTrackingId": "306f4090-645d-48b7-ab7a-0f2345cc2233-160448",
  "iss": "http://localhost:8081/openam/oauth2/realms/root/realms/test",
  "tokenName": "access_token",
  "token_type": "Bearer",
  "authGrantId": "yyChRcvpfgSWhM8WiYHg7ZekVuw",
  "aud": "MedicationsClient",
  "nbf": 1544198678,
  "grant_type": "client_credentials",
  "scope": [
    "user/Medication.write",
    "user/Medication.read"
  ],
  "auth_time": 1544198678,
  "realm": "/test",
  "exp": 1544202278,
  "iat": 1544198678,
  "expires_in": 3600,
  "jti": "RzW5jAtx4s01JD9xiPM_qxfYpbA"
}
```
