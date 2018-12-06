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
sudo chmod 777 -R /docker-data
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

