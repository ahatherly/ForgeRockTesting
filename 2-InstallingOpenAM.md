## Installing OpenAM ##

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

- Rename the downloaded binary files as follows:
  - openam.war
  - amster.zip

- Copy the renamed binary files to the following locations in your clone of the forgeops repository:
  - openam.war: /path/to/forgeops/docker/openam/openam.war

- Now, build the docker images:

```
docker build --tag openam forgeops/docker/openam/
```

- Test the images are there:

```
docker images
```

- Now, create a directory to store the data for our docker containers so it isn't lost every time they are restarted:

```
sudo mkdir -p /docker-data/openam
sudo chown 11111 /docker-data/openam
sudo chmod 777 -R /docker-data/openam
```

## Starting and Configuring the services ##

- Start the openam container:

```
docker run -d --name openam -p 8081:8080 -p 50389:50389 --volume /docker-data/openam:/home/forgerock/openam openam
```

- Now, open a web browser and go to: http://localhost:8081/openam
- Click "Default Configuration"
- Scroll down and agree to the license
- Set a password for the amAdmin account (password)
- OpenAM should now install with an embedded directory

## Installing behind a reverse proxy ##

- If you are installing OpenAM behind a reverse proxy, or use a hostfile to alias it to a nicer hostname for testing, you may find the configuration wizard has problems resolving it's own address to establish free ports for the embedded directory.
- If so, you can resolve this by adding a host entry into the container to resolve the hostname to localhost.
- To do this, add the following parameter to your docker run command, which will inject your hostname into the hosts file inside the container:
```
--add-host my-nice-openam-hostname.com:127.0.0.1
```
- Make sure you are using this hostname when running the configuration wizard, so it can detect that this is the hostname it will be running on.
- Also, note that the configuration wizard uses frames, so if your reverse proxy is adding a "X-Frame-Options DENY" header (which is common for security reasons), you won't see the progress in the wizard (note: it will still work, but you won't see any progress or know when it is complete).

## Installing version 6.5 ##

The Dockerfile for OpenAM in the forgeops repository now makes use of a downloader image which you have to build seperately and provide a key to download the binaries from the ForgeRock website. We don't really want to bother with that, but luckily we can just tweak the dockerfile to work like the version 6.0 one. To do that, edit the forgeops/docker/openam/Dockerfile and replace the first few lines (up to line 13) with the below:

```
# AM Dockerfile
#
# Copyright (c) 2016-2018 ForgeRock AS.
#
#FROM forgerock/downloader 

#ARG VERSION="6.5.0"
#RUN download -v $VERSION openam 
#RUN mkdir -p /var/tmp/openam && unzip -q /openam.war -d /var/tmp/openam

FROM tomcat:8.5-alpine

COPY openam.war /openam.war
RUN mkdir -p /var/tmp/openam && unzip -q /openam.war -d /var/tmp/openam

RUN rm -fr "$CATALINA_HOME"/webapps/*

RUN mv /var/tmp/openam "$CATALINA_HOME"/webapps/openam
```

