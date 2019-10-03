Description
===

Build a API for Persons

Requirements
===

Install [Node Version Manager](https://github.com/nvm-sh/nvm)

Install Node v8.15.0

```
nvm install v8.15.0
```

Use node version

```
nvm use
```

Install dependencies

```
npm install
```

Using Docker
====

Install [Docker Engine Community](https://hub.docker.com/search/?type=edition&offering=community)

Run the following commands

```
cp .env-example .env
docker-compose up -d
```

Sync database

```
node models/setup.js
```



