# Setup for local development

## Prerequisites

- [nodejs 20 LTS](https://nodejs.org/en/)
- npm
- docker

## Git hooks

If you are working at Satoshi Engineering, please configure your GIT repo to use the GIT hooks from the directory `.githooks`:

```sh
git config core.hooksPath .githooks
```

## Local setup

This guide explains how to set up all required tools along with the TipCards backend and frontend using Docker containers.

You can also choose to skip Docker and install the tooling directly on your machine (or even connect to live instances, e.g. [LNBits](https://demo.lnbits.com/)). For that approach, please refer to our [legacy documentation](legacy-setup.md).

### Domain

We use SSL in local development. Since we rely on `*.localhost`, the domains should usually resolve automatically. If they don’t, add the following entries to your `/etc/hosts` file:

```text
# TipCards
127.0.0.1      tipcards.localhost
127.0.0.1      auth.tipcards.localhost
127.0.0.1      lnbits.tipcards.localhost
127.0.0.1      postgres.tipcards.localhost
```

E.g. by running

```sh
echo "
# TipCards
127.0.0.1 tipcards.localhost
127.0.0.1 auth.tipcards.localhost
127.0.0.1 lnbits.tipcards.localhost
127.0.0.1 postgres.tipcards.localhost
" | sudo tee -a /etc/hosts
```

### SSL Certificate

All local routes are proxied through an Nginx service with self-signed certificates. To avoid browser warnings, you’ll need to trust the root certificate (`scripts/docker/nginx/certs/rootCA.pem`) — either system-wide on your OS or at least in the browser you use for testing/running your local TipCards instance.

### Docker environment

By default, all services we run in local Docker containers (e.g. LNBits, Postgres) store their data in a `data` directory at the project root.  

If you don’t want that — for example, on Ubuntu the files may end up owned by `root` and cause issues with other tools — you can override the location by adding something like this to a `.env` file in the project root:

```sh
DATA_DIR=../tip-cards-data
```

#### ARM architecture

The TipCards backend and frontend run inside Debian containers built for AMD. If your host machine uses a different architecture (e.g. Apple Silicon / ARM), copy the `compose.override.yml` file into your project root:

```sh
cp docs/development/compose.override.yml .
```

### Node modules installation

The TipCards backend and frontend run inside Debian containers using the AMD architecture.

- If your host machine is also AMD-based, just run:

    ```sh
    npm install
    ```

    from the project root.

- If not, run:

    ```sh
    scripts/docker/install-dependencies.sh
    ```

    and then add this to your local `.env` file:

    ```sh
    NODE_MODULES_DIR=./node_modules_docker
    ```

### Start TipCards

Start your local setup with:

```sh
docker compose --profile tools --profile dev up -d
```

Or simply use the shortcut:

```sh
npm run dev
```
