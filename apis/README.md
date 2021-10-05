# Configuracion de la maquinas virtuales

### Maquina virtual Debian

Instalaciones necesarias

instalacion de python 3 y pip
```shell
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa (dar enter)
sudo apt update
sudo apt install python3.9

cambiar la configuración por default:
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1

si no cambió:
sudo update-alternatives --set python3 /usr/bin/python3.9

#instalr pip linux
sudo apt update
sudo apt install python3-pip
```
instalacion de go 

```shell
sudo apt update
sudo apt install golang

#probar version
go version
```

### Maquina CentOS
Instalaciones necesarias

Instalacion de docker

```shell
sudo yum install -y yum-utils
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine

sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

sudo yum install docker-ce docker-ce-cli containerd.io

sudo systemctl start docker
```

### Maquina Ubuntu

Instalaciones necesarias

Instalacion de ConteinerD

```shell
sudo apt-get update

sudo apt-get install wget

sudo apt-get install golang

sudo apt-get install runc 

export PATH=$PATH:/usr/local/go/bin


#instalamos containerd
wget https://github.com/containerd/containerd/releases/download/v1.5.4/containerd-1.5.4-linux-amd64.tar.gz

tar xvf containerd-1.5.4-linux-amd64.tar.gz

cd bin

#permitir usar ctr
sudo mv ctr /usr/bin

```

# Configuracion del balanceador de Carga

Se crearon dos balanceadores de carga para poder manejar las 3 apis en las 3 maquinas virtuales

- Balanceador de Python
    Escucha en el puerto 3001

- Balanceador de Go
    Escucha en el puerto 3002



# Configuracion del Pub/Sub

Para el manejo de Pub/Sub se creo un tema con el nombre de **mensajes**
dentro del cual se crea a la vez una suscripcion con el nombre de **mensajes-sub**
