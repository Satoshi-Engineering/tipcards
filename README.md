# ⚡️ Lightning Tip Cards
_by [#sathoshiengineeringcrew](https://satoshiengineering.com/)_

[![MIT License Badge](docs/img/license-badge.svg)](LICENSE)

![](docs/img/TipCardsHeader.png)

# A tip card system based on LNbits and the lightning network

Lightning Tip Cards are a tip (or gift) card system, where you can fund tip cards via the lightning network
and the gifted person can redeem the funded cards. The gifted person gets a short introduction to bitcoin and a lightning
app recommendation to start their journey into the bitcoin rabbit hole.

It is an open-source project developed and operated for the benefit of the Bitcoin community,
with a focus on "How to gentle orange pill nocoiners" - and without warranty of any kind.

[LNbits](https://github.com/lnbits/lnbits) is used for the wallet and lightning payments in the background.

### Explanation Videos
- Youtube: [How to use lightning tip cards - DE](https://youtu.be/26dj0580HYc)
- Youtube: [How to use lightning tip cards - EN](https://youtu.be/bFeEPbupdx8)
- Youtube: [How to create your set of lightning tip cards - DE](https://youtu.be/Oq__BT6oVoM)
- Youtube: [How to create your set of lightning tip cards - EN](https://youtu.be/R6p7fUKu4MY)

`#satohsiengineeringcrew` is `#happy2help`


## Host your own Tip Cars

[Install guide](docs/setup.md)


## Setup for development

- [Development Guidelines](docs/guidelines.md)

### Prerequisites
- [nodejs 16.18.0 LTS](https://nodejs.org/en/)
- npm
- docker (recommended for redis setup, see below)

### Setup

```bash
npm install
```

If you are working at Satoshi Engineering, please configure your GIT repo to use the GIT hooks from  the directory `.githooks`:
```bash
git config core.hooksPath .githooks
```

### Backend

#### Setup

* Setup a redis database on localhost. You can do that by using docker (https://hub.docker.com/_/redis). Just make sure to expose the port 6379 to the host. The modules `rejson` and `redisearch` are required.
* Setting up redis commander is also recommended: https://hub.docker.com/r/rediscommander/redis-commander
  * See [Example](docs/examples/redis) 
* Create your own wallet on https://legend.lnbits.com/ or set your preferred lnbits instance via the env variable `LNBITS_ORIGIN` in `backend/.env` (see below).
* Create a `backend/.env` file (or copy it from `backend/.env.example`) and set the following variables:
  - `TIPCARDS_ORIGIN` probably http://localhost:5173 -> where your frontend will be served
  - `TIPCARDS_API_ORIGIN` probably http://localhost:4000 -> where your backend will be served
  - `LNBITS_INVOICE_READ_KEY` paste from your lnbits wallet: get this from https://legend.lnbits.com/wallet and clicking on "API info"
  - `LNBITS_ADMIN_KEY` paste from your lnbits wallet: get this from https://legend.lnbits.com/wallet and clicking on "API info"
* You can look up additional optional variables in `.env.example`

#### Custom Env File

Per default the backend loads the `backend/.env` file. If you need different setups locally (e.g. one for development and one for running integration tests) you can load a different one by adding a commandline argument. For running the backend you can use `npm run backend-dev -- --envFilePostfix=somePostFix` which would use the file `backend/.env.somePostFix`. You can also add the parameter to all other commands (cli, integration test, etc.).

#### Integration Test Script

You can run backend integration tests locally, including starting the local backend, in one command by running the helper script `./backend-integration-tests.sh`. This command uses the `backend/.env.integrationTest` env file (see Custom EnvFile).

Alternately if you want to run specific tests you could do:
```bash
# create custom env file for testing + startup backend using it
vi backend/.env.integrationTest
npm run backend-dev -- --envFilePostfix=integrationTest

# run a specific test using the same env file
cd backend
../node_modules/jest/bin/jest.js --config jest.config.js --runInBand --testTimeout=50000 --envFilePostfix=integrationTest tests/integration/api/auth.test.ts
```

### Frontend

* Create a `frontend/.env.development.local` file  (or copy it from `frontend/.env.development`)  and add the following variable:
  - `VITE_BACKEND_API_ORIGIN` probably http://localhost:4000 -> where your frontend will be served

### Testing

If you want to test the tipcards on your local machine, here are some hints
- Fund your https://legend.lnbits.com/wallet with 1 - 100sats. The tipcard redeeming creates a lightning invoice 
via lnbits and there are transaction costs.
- It won't work with your smartphone, because the development setup restricted to localhost. (And if you use `vite --host` to expose the port,
your lightning apps will refuse to work because there is no ssl connection)
  - We use BlueWallet Deskop app for testing (it can access localhost) 


## Tools

### VSCode

#### Recommended Extensions

* [Vue - Official](https://marketplace.visualstudio.com/items?itemName=vue.volar)
* [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss)
* [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### Ngrok

Ngrok is used to expose you local environment to the web. This is needed to test auth/backend features with your phone (e.g. paying invoices, logging in via lnurl-auth).

1. Copy backend/.env.example into backend/.env
2. Go to https://ngrok.com and create an account
3. Go to https://dashboard.ngrok.com/get-started/setup, copy your authtoken and add it to backend/.env
4. Run `npm run proxy` in the backend directory. This starts an express server that proxies all requests to your other services that we will start later.
5. Run `npm run ngrok` in the backend directory. Then copy the ngrok url that will be pasted in the console (something like https://cdb6-62-178-206-224.ngrok.io).
6. Open backend/.env and set the ngrok url (from the previous point) for `TIPCARDS_ORIGIN` and `TIPCARDS_API_ORIGIN` as this is now your public URL for your phone and lnbits webhooks.
7. Open frontend/.env.development.local and set `VITE_BACKEND_API_ORIGIN=` to an empty string. The API origin will be the same as the frontend origin (the ngrok URL).
8. Run `npm run dev` in frontend/ and backend/ directories.

### Script

For additional developer tasks, scripts can be found in [scripts](scripts/README.md).

## Run from source

Start the frontend server on http://localhost:5173
```bash
npm run frontend-dev
```

Start the backend server on http://localhost:4000
```bash
npm run backend-dev
```


## Production

Deployment is done via Gitlab CI/CD, see .gitlab-ci.yml


## Tip us

If you like this project, please adapt the landingpage to your local stores, that
accept bitcoin or even extend it. Why not [send some tip love?](https://satoshiengineering.com/tipjar/)
