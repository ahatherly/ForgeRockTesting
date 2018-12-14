/*
 * Script to grant or deny SMART on FHIR style OAuth2 scopes based
 * on user attributes (e.g. RBAC roles)
 */

logger.message("resourceURI (Requested Scope): " + resourceURI);
logger.message("username (Subject): " + username);

var isUser =               username.indexOf("ou=user") !== -1;
var isSystem =             username.indexOf("ou=agent") !== -1;
// The below would be replaced with something that checks RBAC attributes for the user rather than using hard-coded user IDs
var isClinicalUser =       username.indexOf("912345000001") !== -1;
var isAdministrativeUser = username.indexOf("912345000002") !== -1;
var isAuditUser =          username.indexOf("912345000003") !== -1;
// The below would be replaced with something that looks up the interactions a system is allowed to do without a user context
var isMedicationsClient =  username.indexOf("MedicationsClient") !== -1;
var isPatientClient =      username.indexOf("PatientClient") !== -1;


if (isUser) {
    authorized = applyUserPermissions();
} else if (isSystem) {
    authorized = applySystemPermissions();
} else {
    logger.message("Unrecognised user/system - denying all scopes.");
    authorized = false;
}

logger.message("Scope: " + resourceURI + " Authorised: " + authorized);


/*
 * User-specific AuthZ
 */
function applyUserPermissions() {
  if (isClinicalUser) {
      logger.message("Clinical user - allowing all scopes.");
      return true;
  } else if (isAdministrativeUser) {
      logger.message("Aministrative user - allowing only Patient scopes.");
      if (resourceURI == 'user/Patient.read' || resourceURI == 'user/Patient.write') {
        return true;
      } else {
        return false;
      }
  } else if (isAuditUser) {
      logger.message("Audit user - allowing only read scopes.");
      if (resourceURI == 'user/Patient.read' || resourceURI == 'user/Medication.read') {
        return true;
      } else {
        return false;
      }
  } else {
      logger.message("Unknown user - denying all scopes.");
      return false;
  }
}

/*
 * System-only AuthZ
 */
function applySystemPermissions() {
  if (isMedicationsClient) {
      logger.message("Medications System - allowing only Medication scopes.");
      if (resourceURI == 'user/Medication.read' || resourceURI == 'user/Medication.write') {
        return true;
      } else {
        return false;
      }
  } else if (isPatientClient) {
      logger.message("Patient System - allowing only Patient scopes.");
      if (resourceURI == 'user/Patient.read' || resourceURI == 'user/Patient.write') {
        return true;
      } else {
        return false;
      }
  } else {
      logger.message("Unknown system - denying all scopes.");
      return false;
  }
}
