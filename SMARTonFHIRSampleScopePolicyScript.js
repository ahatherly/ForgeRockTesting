/*
 * Script to grant or deny SMART on FHIR style OAuth2 scopes based
 * on user attributes (e.g. RBAC roles)
 */


logger.message("resourceURI: " + resourceURI);
logger.message("username: " + username);

// Put some proper logic here!
if (username == 'id=912345000001,ou=user,o=test,ou=services,dc=openam,dc=forgerock,dc=org') {
  authorized = true;
  logger.message("Clinical user - allowing all scopes.");
} else if (username == 'id=912345000002,ou=user,o=test,ou=services,dc=openam,dc=forgerock,dc=org') {
  if (resourceURI == 'Patient.read' || resourceURI == 'Patient.write') {
    authorized = true;
  } else {
    authorized = false;
  }
  logger.message("Aministrative user - allowing only Patient scopes.");
} else if (username == 'id=912345000002,ou=user,o=test,ou=services,dc=openam,dc=forgerock,dc=org') {
  if (resourceURI == 'Patient.read' || resourceURI == 'Medication.read') {
    authorized = true;
  } else {
    authorized = false;
  }
  logger.message("Audit user - allowing only read scopes.");
} else {
   authorized = false;
}
logger.message("Scope: " + resourceURI + " Authorised: " + authorized);

