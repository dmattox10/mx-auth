# mx-auth
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A global auth micro-service for all of my projects to use
<hr>

live [HERE](https://auth.danielmattox.com)

<hr>

## About this project

__Motivation__

Rewriting auth for every project gets annoying! 

__Tech__
- Express, JWT
- ~~MongoDB❤️~~ Knex, SQLite, MariaDB, because I want a job.

__What I Learned__

- JWT Token flow with refresh tokens used to get new auth tokens instead of signing out
- Client side password salting and hashing, I insist! User passwords never leave the device.
- CORS Whitelisting
- Using the shared secret to auth separate apps in the style of vis-a-vis microservices, while being able to quickly revoke the secret and all tokens by changing it in the event of some kind of breach

## Getting Started

Env settings affect database selection. development uses SQLite, as written staging and production use MySQL2/MariaDB

__Sample server/.env file__
```
APP_PORT = 5000
APP_NAME = mx-auth
ENVIRONMENT = development
SHARED_SECRET = shhhh
REFRESH_SECRET = sofreshhhh
```
__Sample docker-compose.yml__
    ---
    version: '3.7'

    services:
    auth:
        build:
        context: ./
        dockerfile: Dockerfile
        image: mx-auth
        container_name: mx-auth
        hostname: mx-auth
        command: /usr/src/app/node_modules/.bin/nodemon server.js
        volumes:
        - ./server:/usr/src/app
        - /usr/src/app/node_modules
        ports:
        - "5000:5000"
        env_file: ./.env

    volumes:
    data-volume:
    node_modules:
    web-root:
        driver: local
__Commands__
```
docker-compose build
docker-compose up -d
```
## Routes

__POST /v1/auth/register__

This route expects:
 - email: The registering user's email address.
 - hashedPassword: The registering user's already salted + hashed password
 - portal: The string APP_NAME used in my projects, in this case which project is using mx-auth to register the user.

This route returns:
 - the user created in the system.

__POST /v1/auth/login__
This route expects:
 - email
 - HashedPassword

This route returns:
 - an accessToken
 - a refreshToken

__GET /v1/auth/refresh__
This route expects:
 - refreshToken: place the refresh token in the header.

This route returns:
 - a new accessToken

__DELETE /v1/auth/logout__
This route expects:
 - accessToken: a valid accessToken in the header.

This route returns:
 - http status code 204 in the case the token exists, and was deleted.

This one removes the users current token from the system, disabling their access from all devices, to all services.