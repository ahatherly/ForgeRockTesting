## Tutorial ##

This is a step-by-step guide to setting up a minimal ForgeRock OpenAM solution using Docker, and using it to authenticate and authorise access to resources.

NOTE: These were notes I took while learning about the product and how it could be used to solve the particular problems I wanted to solve - it isn't intended to be a comprehensive OpenAM guide. For formal documentation, please refer to the online documentation:

- https://backstage.forgerock.com/docs/am/6/maintenance-guide/
- https://backstage.forgerock.com/docs/am/6/authorization-guide/

## Contents ##

1. [Setting up Linux](1-SettingUp.md)
2. [Installing OpenAM](2-InstallingOpenAM.md)
3. [Create and configure a Realm and Client](3-CreateAndConfigureRealmAndClient.md)
4. [Add consent attribute to embedded directory (optional)](4-AddAttributeToDirectory.md)
5. [Configure Scope-based User Authorisation](5-ScopeBasedUserAuthZ.md)
6. [Configure System-to-System Authorisation](6-SystemToSystemAuthZ.md)
7. [Adding custom claims to access token](7-AddingCustomAccessTokenClaims.md)
8. [Federating with WSO2 API Manager](8-FederatingWithWSO2.md)
9. [Protecting APIs with WSO2 API Manager using OpenAM identities](9-ProtectingAPIsWithWSO2.md)

