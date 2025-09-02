# ⚡️ Lightning TipCards

_by [#sathoshiengineeringcrew](https://satoshiengineering.com/)_

[![Version](https://img.shields.io/github/package-json/v/Satoshi-Engineering/tipcards?color=6B3D91)](https://github.com/Satoshi-Engineering/tipcards/)
[![License](https://img.shields.io/github/license/Satoshi-Engineering/tipcards?color=6B3D91)](https://github.com/Satoshi-Engineering/tipcards/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/Satoshi-Engineering/tipcards.svg?style=flat&color=6B3D91)](https://github.com/Satoshi-Engineering/tipcards/stargazers)

![TipCards Preview](docs/img/TipCardsHeader.png)

## A tip card system based on LNbits and the lightning network

Lightning TipCards are a tip (or gift) card system, where you can fund tip cards via the lightning network
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

## Host your own TipCards

[Install guide](docs/setup.md)

## Setup for development

- [Development Guidelines](docs/guidelines.md)

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

## Tools

### VSCode

#### Recommended Extensions

- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=vue.volar)
- [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### Scripts

For additional developer tasks, scripts can be found in [scripts](scripts/README.md).

## Production

Deployment is done via Gitlab CI/CD, see .gitlab-ci.yml

## Tip us

If you like this project, please adapt the landingpage to your local stores, that
accept bitcoin or even extend it. Why not [send some tip love?](https://satoshiengineering.com/tipjar/)
