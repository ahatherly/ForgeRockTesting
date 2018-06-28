
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

- Clone the forgeops repository and switch to the release 6 branch:

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

- First, start the OpenDJ container:

```
docker run -d --name opendj -p 1389:1389 -p 636:636 -p 4444:4444 -p 8989:8989 --volume /docker-data/opendj:/opt/opendj/db opendj
docker run -d --name opendj -p 1389:1389 -p 636:636 -p 4444:4444 -p 8989:8989 opendj
```

- Test connecting to the LDAP directory:
  - Install JXplorer: ```sudo apt install jxplorer```
  - Start it and connect to localhost on port 1389
  - You should see a tree view with userstore and cts branches

- Now, start the openam container:

```
docker run -it --name openam -p 8081:8080 -p 50389:50389 --volume /docker-data/openam:/home/forgerock/openam openam
```

- Now, open a web browser and go to: http://localhost:8081/openam
- Click "Custom Configuration"
- Scroll down and agree to the license
- Set a password for the amAdmin account (password)
- Leave server settings as defaults and click next
- Choose "External DS"
- Change the port to 1636
- Set a password (password)
- Leave the rest as default and click next
- Set the password again (password)
- Click Next
- Click Next
- Click Create Configuration


