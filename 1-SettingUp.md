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

## Set-up in Amazon Linux ##

If you're using Amazon linux use these commands instead:

```
sudo yum update -y
sudo yum install git
sudo amazon-linux-extras install docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker $USER
```

- You'll need to log out and in again now for this to take effect (closing and re-opening the terminal window will do)

