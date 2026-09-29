# LNbits Deterministic Test Bootstrap

The LNbits test environment starts from an empty PostgreSQL database and is provisioned by an idempotent bootstrap. No LNbits database dump or restore script is committed.

## Startup contract

Compose and the GitLab integration and end-to-end jobs use this order:

```text
lnbits-postgres -> lnbits -> lnbits-bootstrap -> backend -> tests
```

The frontend remains independent of the bootstrap. The one-shot `lnbits-bootstrap` service must exit successfully before either backend starts. Bootstrap failures are reported with LNbits and bootstrap logs without printing credentials.

LNbits is pinned in `compose.yml` to v1.6.0 and uses PostgreSQL 16.9 with `FakeWallet`. A small derived image patches two upstream LNURL-auth regressions in that release. The bootstrap installs and enables the pinned `withdraw` 1.3.0 and `lnurlp` 1.3.2 extensions.

All test wallets intentionally use sats without a fiat currency. This keeps payment tests independent of external exchange-rate providers.

## Wallet contract

The bootstrap provisions these wallet roles and never reduces a higher existing balance:

| Role | Wallet name | Committed variable | Minimum balance |
| --- | --- | --- | --- |
| Application | `Application` | `LNBITS_ADMIN_KEY` and `LNBITS_INVOICE_READ_KEY` | 1,000,000 sats |
| Integration and browser-test user | `Test User Wallet` | `LNBITS_ADMIN_KEY_TEST_USER_WALLET` | 3,000,000 sats |

The committed values are deterministic local and CI fixtures. Never reuse them for hosted or production wallets.

`backend/.env` owns the application keys and shared test-user key. `e2e/.env` repeats the test-user key so its configuration remains self-contained. The bootstrap validates that the duplicated values match. Playwright also owns its application-wallet key in `e2e/.env`.

Wallet IDs and the test-user invoice key are generated values, not application contracts.

## Provisioning behavior

Run the bootstrap directly with:

```sh
npm run lnbits:bootstrap -- [LNbits base URL]
```

It defaults to `http://127.0.0.1:4050` on the host and `http://lnbits:4050` in a container. `LNBITS_BASE_URL` can override the API URL, and `LNBITS_DATABASE_URL` can override the PostgreSQL connection.

The bootstrap:

1. Waits for LNbits with a bounded timeout.
2. Completes first installation or authenticates the existing local bootstrap identity.
3. Allows LNURL requests and payment callbacks to the local Docker network. Compose mounts the combined CA bundle at LNbits' `certifi` path because the hardened LNURL client does not read `SSL_CERT_FILE`.
4. Installs and enables the pinned extensions.
5. Reuses the clean installation's single automatic wallet as `Application` and creates or resolves `Test User Wallet`.
6. Reconciles the committed keys and clears wallet currency.
7. Funds each wallet only up to its required minimum.
8. Verifies the final wallet contract through authenticated API responses.

LNbits v1.6.0 cannot accept caller-supplied wallet keys or clear wallet currency through its wallet APIs. The bootstrap therefore uses supported APIs for provisioning and a narrow PostgreSQL update for the resolved wallet IDs. The reconciliation verifies the pinned `public.wallets` schema before updating only `adminkey`, `inkey`, and `currency`. Any LNbits image upgrade must revalidate this assumption first.

## Clean rebuild without touching developer data

Use a temporary data directory to validate a genuinely clean environment without deleting the configured development data:

```sh
LNBITS_BOOTSTRAP_DATA_DIR="$(mktemp -d)"
DATA_DIR="$LNBITS_BOOTSTRAP_DATA_DIR" docker compose --profile tools --profile test up -d --wait
DATA_DIR="$LNBITS_BOOTSTRAP_DATA_DIR" docker compose --profile tools --profile test up -d --wait
DATA_DIR="$LNBITS_BOOTSTRAP_DATA_DIR" docker compose --profile tools --profile test down
```

The second start verifies idempotency. After the temporary stack is down, the temporary directory can be deleted. The normal stack continues to use the data directory configured in `.env`.
