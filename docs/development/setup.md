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

## Using your local TipCards instance

With this setup, a local LNBits instance is used. It comes preloaded with funds but is not connected to any external nodes.   Three wallets are configured. To fund a TipCard or withdraw Bitcoin, log in to your local LNBits instance via this link: [https://lnbits.tipcards.localhost](https://lnbits.tipcards.localhost/wallet?usr=79687332617c4a7fa27cb5d61e2603e0)

⚠️ Note: The first wallet (**develop**) is reserved for the TipCards backend. Use **Wallet2** or **Wallet3** instead. In the TipCards frontend, click **Copy** (where you’d normally scan a QR code on a funding or landing page), then in LNBits click **Paste request** and complete the payment/withdrawal.

You can also log in to your local TipCards instance:  

- Click **Login** in the frontend  
- In the overlay, click **Copy LNURL**  
- Go to the helper tool [LNURL Web Wallet](https://foss.tsp.tools/wallet)  
- Paste the LNURL and click **Login via new tab**  

This creates a small web wallet in your browser that calls your local TipCards backend to log you in.

### Local LNBits instance credentials

- URL: [https://lnbits.tipcards.localhost](https://lnbits.tipcards.localhost)  
- **Superuser**  
  - Username: `superuser`  
  - Password: `superpassword`  
- **Development user**  
  - Username: `develop`  
  - Password: `developpassword`  

#### Wallets

- **Wallet develop** (used by TipCards backend)  
  - Id: `171199a3d97a43c0b5fe811e32d47012`  
  - AdminKey: `8d4e4a151ae5446586ab283e4a89d98c`  
  - InvoiceKey: `f95447ee6414419b8ff3e415a4e359f8`  

- **Wallet2**  
  - Id: `161dee222082452baef5700de7553b3f`  
  - AdminKey: `6da0c95636c44058bf1d09933476ac26`  
  - InvoiceKey: `c2b6f2dcbdc944d3b4b932783d28a6db`  

- **Wallet3**  
  - Id: `563486e6cac2468b8e69293d1e77832d`  
  - AdminKey: `29f376ee8bec4503b241eb912666c397`  
  - InvoiceKey: `ea059680d75b4b86aa2f9d0facf0edf5`  

## Additional info

### Resetting your dev instance

- Stop all containers:

    ```sh
    npm run docker:down
    ```

- Delete the data directory (`./data` or the directory defined in `.env`)
- Restart the containers

### Updating TipCards or LNBits database dumps

If you made local changes in TipCards or LNBits that should be shared with the project (e.g. creating pre-funded TipCards for E2E tests), you can update the database dumps with:

```sh
npm run docker:save-tipcards-database-to-sql
npm run docker:save-lnbits-database-to-sql
```
