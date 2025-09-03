# Setup for local development

### Prerequisites

- [nodejs 20 LTS](https://nodejs.org/en/)
- npm
- docker

### Git hooks

If you are working at Satoshi Engineering, please configure your GIT repo to use the GIT hooks from  the directory `.githooks`:

```bash
git config core.hooksPath .githooks
```

### Backend

- Setup a postgres database (locally or remote doesn't matter)
- Create your own [lnbits wallet](https://demo.lnbits.com/) or set your preferred lnbits instance via the env variable `LNBITS_ORIGIN` in `backend/.env.local` (see below).
- Create a `backend/.env.local` file (or copy it from `backend/.env`) and configure database and lnbits connection
- Additional configuration options are described in `backend/.env` (do not change it directly, copy the things you want to `backend/.env.local` and change them there).

#### Integration Test Env File

Per default the backend loads the `backend/.env` and `backend/.env.local` files. If you need to start the backend for integration tests you have can use a different env file. Run the backend using `npm run backend-dev -- --envIntegrationTest` which will also use the file `backend/.env.integrationTest`. You can also add the parameter to all other commands (cli, drizzle-migration, etc.).

#### Integration Test Script

You can run backend integration tests locally, including starting the local backend, in one command by running the helper script `./backend-integration-tests.sh`. This command uses the `backend/.env.integrationTest` env file (see Integration Test Env File).

Alternately, if you want to run specific tests, you could do:

```bash
# create custom env file for testing + startup backend using it
vi backend/.env.integrationTest
npm run backend-dev -- --envIntegrationTest

# run a specific test using .env.integrationTest
npm run backend-test-one-integration-route ./backend/tests/integration/your/custom/test.ts
```

### Frontend

- Create a `frontend/.env.local` file  (or copy it from `frontend/.env`)  and add the following variable:
  - `VITE_BACKEND_API_ORIGIN` probably `http://localhost:4000` -> where your frontend will be served

### Testing

If you want to test the tipcards on your local machine, here are some hints:

- Fund your [LNBits wallet](https://demo.lnbits.com/wallet) with 1 - 100sats. The tipcard redeeming creates a lightning invoice via lnbits and there are transaction costs.
- It won't work with your smartphone, because the development setup restricted to localhost. (And if you use `vite --host` to expose the port,
your lightning apps will refuse to work because there is no ssl connection)
  - We use BlueWallet Deskop app for testing (it can access localhost)
