
## Setting up Linux ##

- This assumes you are running a recent Ubuntu version.
- Ensure you have git installed in linux:

```
sudo apt update
sudo apt install git
```

- Install Docker CE:

```
sudo apt-get update
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install docker-ce
```

- Add your user to the docker group so you can run commands without sudo:

```
sudo groupadd docker
sudo usermod -aG docker $USER
```

- You'll need to log out and in again now for this to take effect (closing and re-opening the terminal window will do)

## Installing Forgerock ##

- Go to: https://go.forgerock.com/Registration-Trials-Download.html and create an account

- Clone the forgeops repository and switch to the relevant release branch:

```
git clone https://github.com/ForgeRock/forgeops.git
cd forgeops
git checkout release/6.0.0
```

- Download the binary files for the forgerock products you need from: https://backstage.forgerock.com/downloads/
- You will need to create an account and set a password when you do this.

- Download the following:
  - AM-6.X.war
  - Amster-6.X.zip
  - DS-6.X.zip

- Rename the downloaded binary files as follows:
  - openam.war
  - amster.zip
  - opendj.zip

- Copy the renamed binary files to the following locations in your clone of the forgeops repository:
  - openam.war: /path/to/forgeops/docker/openam/openam.war
  - opendj.zip: /path/to/forgeops/docker/opendj/opendj.zip

- Now, build the docker images:

```
docker build --tag opendj forgeops/docker/opendj/
docker build --tag openam forgeops/docker/openam/
```

- Test the images are there:

```
docker images
```

- Now, create a directory to store the data for our docker containers so it isn't lost every time they are restarted:

```
sudo mkdir /docker-data
sudo mkdir /docker-data/openam
sudo mkdir /docker-data/opendj
sudo chmod 777 -R /docker-data
```

## Starting and Configuring the services ##

- Start the openam container:

```
docker run -it --name openam -p 8081:8080 -p 50389:50389 --volume /docker-data/openam:/home/forgerock/openam openam
```

- Now, open a web browser and go to: http://localhost:8081/openam
- Click "Default Configuration"
- Scroll down and agree to the license
- Set a password for the amAdmin account (password)
- OpenAM should now install with an embedded directory


## Create and configure a Realm and Client ##

- Click create realm
- Give it a name "test"
- Click create
- Add a client:
	- Click Applications > Oauth2
	- Click Add Client
	- Set a clientid: 860700880739.apps.hackathon
	- Set a secret: 862c1b29-d075-4da5-b6d9-3089140e04bd
	- Set a redirect URI: http://localhost:8080/strategicauthclient/redirect
	- Set a scope: profile
	- Click create
- Add a service:
	- Oauth2 Provider
	- Scopes: profile
	- Click Create
- Create a user:
	- Click Identities
	- Click Add Identity
	- Create a user with a password:
		- 912345000001 / password123


## Test using an OpenID Connect client

- Make sure you configure the correct settings in the client:
	- Clientid: 860700880739.apps.hackathon
	- Secret: 862c1b29-d075-4da5-b6d9-3089140e04bd
	- Redirect URI: http://localhost:8080/strategicauthclient/redirect
	- Authorisation endpoint: http://localhost:8081/openam/oauth2/realms/test/authorize
	- Token endpoint: http://localhost:8081/openam/oauth2/realms/test/access_token


## Update directory to add an attribute to hold the consent decision (optional)

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

- Use an LDAP client to edit the Self-Writable attributes as per instructions here: https://backstage.forgerock.com/docs/am/6/maintenance-guide/index.html#sec-maint-datastore-customattr
- Restart OpenAM:

```
docker stop openam; docker start openam
```

- Log back into the OpenAM console and edit the OAuth2 provider entry
- Click the small drop-down arrow to the right of "Advanced OpenID Connect" and click "Consent"
- In the "Saved Consent Attribute Name" box, enter ```customAttribute``` and save changes


