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

The local LNbits service, wallet contract, and clean rebuild workflow are documented in [LNbits deterministic test bootstrap](lnbits-bootstrap.md).

You can also choose to skip Docker and install the tooling directly on your machine (or even connect to live instances, e.g. [LNBits](https://demo.lnbits.com/)). For that approach, please refer to our [legacy documentation](legacy-setup.md).

### Domain

We use SSL in local development. Since we rely on `*.localhost`, the domains should usually resolve automatically. If they don’t, add the following entries to your `/etc/hosts` file:

```text
# TipCards
127.0.0.1      tipcards.localhost
127.0.0.1      auth.tipcards.localhost
127.0.0.1      lnbits.tipcards.localhost
127.0.0.1      postgres.tipcards.localhost
127.0.0.1      postgres.lnbits.tipcards.localhost
```

E.g. by running

```sh
echo "
# TipCards
127.0.0.1 tipcards.localhost
127.0.0.1 auth.tipcards.localhost
127.0.0.1 lnbits.tipcards.localhost
127.0.0.1 postgres.tipcards.localhost
127.0.0.1 postgres.lnbits.tipcards.localhost
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
    npm run docker:install-dependencies
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

Or the npm script helpers:

```sh
npm run docker:tools:up
npm run docker:test:up
```

Or simply use the shortcut:

```sh
npm run dev
```

## Using your local TipCards instance

With this setup, a local LNBits instance is used. It is bootstrapped with funds but is not connected to any external nodes. To fund a TipCard or withdraw Bitcoin, sign in to [https://lnbits.tipcards.localhost](https://lnbits.tipcards.localhost) with the local superuser credentials below and select **Test User Wallet**.

⚠️ Note: The **Application** wallet is reserved for the TipCards backend. Use **Test User Wallet**, the shared test-user wallet, instead. In the TipCards frontend, click **Copy** (where you’d normally scan a QR code on a funding or landing page), then in LNBits click **Paste request** and complete the payment/withdrawal.

You can also log in to your local TipCards instance:  

- Click **Login** in the frontend  
- In the overlay, click **Copy LNURL**  
- Go to [https://lnbits.tipcards.localhost](https://lnbits.tipcards.localhost), sign in, and select **Test User Wallet**
- Click **Paste request** and complete the login

### Local LNBits instance credentials

- URL: [https://lnbits.tipcards.localhost](https://lnbits.tipcards.localhost)
- The local superuser credentials are defined in `scripts/docker/lnbits/.env`.

#### Wallets

- **Application** (used by TipCards backend)
  - Admin and invoice keys are defined in `backend/.env`.
  - Minimum balance: 1,000,000 sats

- **Test User Wallet** (used by backend integration and Playwright)
  - The admin key is defined in `backend/.env` and `e2e/.env`.
  - Minimum balance: 3,000,000 sats

Wallet IDs and the test-user invoice key are generated during bootstrap and are not application contracts. Both wallets intentionally use sats without a fiat currency.

## Additional info

### Resetting your dev instance

- Stop all containers:

    ```sh
    npm run docker:down
    ```

- Delete the data directory (`./data` or the directory defined in `.env`)
- Restart the containers

### Updating the TipCards database dump

⚠️ Avoid creating a database dump while TipCards is running!

If you made local TipCards database changes that should be shared with the project, update its database dump with:

```sh
npm run docker:dev:down
npm run docker:test:down
npm run docker:save-tipcards-database-to-sql
npm run dev
```

LNbits has no committed database dump. It initializes an empty database and provisions its extensions, wallets, balances, and committed test keys through the idempotent bootstrap.
