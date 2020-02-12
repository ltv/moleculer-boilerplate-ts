# Source code

Include FrontEnd, BackEnd, Docs, Database

## Repository

Please login into `gitlab` (send email to `luc@ltv.vn` to add account to projects)

- [gitlab](git@gitlab.com:ltv/ltv-coffee/ltv-coffee.git)

### Setup push code by ssh key

**Benefit**: Push code to `source respository` without typing password

Steps:

- Generate ssh key if you don't have one: [generate ssh](https://gitlab.com/help/ssh/README#generating-a-new-ssh-key-pair)

- If you have exited ssh key: [existing ssh](https://gitlab.com/help/ssh/README#locating-an-existing-ssh-key-pair)

- Then add to ssh manager on you account in `soure respository`: [ssh manager](https://gitlab.com/profile/keys)

## ⚒️ LTV Coffee Backend

Backend with micro-services framework

Path: `$project/packages/server`

[AIS Postman](https://www.getpostman.com/collections/aeac4d071787299a0a68)

### Prerequisite

++ On Linux, run install script

```sh
# Install docker 🐳
curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh
docker -v

# Install docker-compose
sudo curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose -v

sudo sed -i '/^ExecStart.*$/c\ExecStart=/usr/bin/dockerd -H unix:// -H tcp://0.0.0.0:6513' /lib/systemd/system/docker.service
# Restart docker daemon
sudo systemctl daemon-reload
sudo systemctl restart docker

sudo gpasswd -a $USER docker
echo "Please restart to apply change (y/Y)" && read

```

++ On Mac/Windows, follow below guide

```sh
+ Docker for Mac: https://docs.docker.com/docker-for-mac/install/
+ Docker for Windows: https://docs.docker.com/docker-for-windows/install/
```

```sh
sudo ln -s /mnt/c/Program\ Files/Docker/Docker/resources/bin/docker.exe /usr/local/bin/docker
sudo ln -s /mnt/c/Program\ Files/Docker/Docker/resources/bin/docker-compose.exe /usr/local/bin/docker-compose
```

[Reference](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly)

### Start Development

- In `server`

++ Add .env.environment

```sh
# molculer config
GATEWAY_PORT=3000
JWT_SECRET=wMFgWrYwP19Red9dpn43hNMvSoaJrCMn
TRANSPORTER_URL=nats://localhost:4222
DATABASE_HOST=210.245.33.182
DATABASE_NAME=ltvcoffee
DATABASE_USER=ltvcoffee
DATABASE_PASS=Ltv!@#123
DATABASE_PORT=5432
DATABASE_POOL_MIN=1
DATABASE_POOL_MAX=1

DB_REDIS_HOST=localhost
DB_REDIS_PORT=6379
WAIT_SERVICE_TIMEOUT=30
SALT_ROUNDS=10
APOLLO_ENGINE_KEY=service:ltv-coffee:OVXTgceZDzivrKVdC61d2g
HASH_SECRET=H3GmHGm7eeTFjIBVg2DJz7HM5uin2uYu
```

```sh
# Project setup
yarn

# Compiles and hot-reloads for development
yarn serve
```

After successfully start server, we have:

|                            | Link                                                 |
| -------------------------- | ---------------------------------------------------- |
| **Server**                 |
| + API Gateway              | [GraphQL](http://localhost:3000/graphql)             |
|                            |
| **Tools**                  |
| + Postgres Admin dashboard | [Postgres Admin](http://localhost:5433)              |
| + Redis Admin Dashboard    | [Redis Admin](http://localhost:6380)                 |
|                            |
| **External Services**      |
| + PostgresDB               | running on port 5432                                 |
| + Redis                    | running on port 6379                                 |
| + NATS                     | running on port 4222(together with 4444, 6222, 8222) |

### 📒 Notes

#### Database Migration

```sh
# Review knex cmd
knex --help

# Create new migration file
- At service folder
- Use "knex" cmd, to create new migration file
- Modify created file to update database schema

$ knex migrate:make [FILE_NAME]

# On start, service will auto run migration
```

#### Postgres Admin Dashboard

```sh
# After successfully run docker to setup environemnt
# pgAdmin 4 run on port 5433, open browser:
http://localhost:5433

# Login info
+ user: admin@ltv.vn
+ pass: Ltv!@#123

# Add "new server" with config
# + localhost
|     | Key           | Value        |
| --- | ------------- | ------------ |
| 1   | Connection    | postgres10.5 |
| 2   | Port          | 5432         |
| 3   | Database name | ltvcoffee    |
| 4   | User          | ltvcoffee    |
| 5   | Pass          | Ltv!@#123    |

# + coffee server
# TODO: UPDATE CONFIG
|     | Key           | Value      |
| --- | ------------- | ---------- |
| 1   | Connection    | ltv.coffee |
| 2   | Port          | 5432       |
| 3   | Database name | postgres   |
| 4   | User          | postgres   |
| 5   | Pass          | postgres   |
```

- Screenshot

![pgAdmin4](/docs/images/pgadmin-4-2018-10-23_153736.png)

#### Built-in GraphQL

GraphQL's schema on services will be merged by API-gateway to create GraphQL playground [http://localhost:3000/graphql](http://localhost:3000/graphql). Run & test query with GraphQL's playground

![GraphQL's playground](/docs/images/GraphQL.png)

## ⚒️ LTV Coffee Frontend

Frontend with VUE framework

Path: `$project/packages/client`
