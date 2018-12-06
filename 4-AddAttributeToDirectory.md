## Add consent attribute to embedded directory (optional)

- NOTE: There's almost certainly a better way to do this :) - see this page for instructions: https://backstage.forgerock.com/docs/am/6/maintenance-guide/index.html#sec-maint-datastore-customattr
- Open a shell in the running container:

```
docker exec -it openam /bin/bash
```

- Create a file: /home/forgerock/openam/opends/config/custom-consent-attr.ldif
- Add this content:

```
dn: cn=schema
changetype: modify
add: attributeTypes
attributeTypes: ( temp-custom-attr-oid NAME 'consentPreferences' EQUALITY case
 IgnoreMatch ORDERING caseIgnoreOrderingMatch SUBSTR caseIgnoreSubstrings
 Match SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 USAGE userApplications )
-
add: objectClasses
objectClasses: ( temp-custom-oc-oid NAME 'customObjectclass' SUP top AUXILIARY
  MAY consentPreferences )
```

- Load it into the LDAP:

```
cd /home/forgerock/openam/opends
bin/ldapmodify --port 50389 --hostname 127.0.0.1 --bindDN "cn=Directory Manager" --bindPassword password config/custom-consent-attr.ldif
```

- Use an LDAP client to edit the Self-Writable attributes:
	- In the AM console, browse to Realms > Realm Name > Data Stores > Data Store Name > User Configuration.
	- Add the object class '''customObjectclass''' to the LDAP User Object Class list.
	- Add the attribute type '''consentPreferences''' to the LDAP User Attributes list.
	- Clict Save.
- Restart OpenAM:

```
docker stop openam; docker start openam
```

- Log back into the OpenAM console and edit the OAuth2 provider entry
- Click the small drop-down arrow to the right of "Advanced OpenID Connect" and click "Consent"
- In the "Saved Consent Attribute Name" box, enter ```consentPreferences``` and save changes

