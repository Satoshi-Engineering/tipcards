# Migrating the LNbits Test Seed to a Deterministic Bootstrap

This guide contains four prompts for replacing the committed LNbits PostgreSQL dump with an idempotent bootstrap. Give Codex one prompt at a time, review and commit the result, and only then continue with the next prompt.

The migration should be incremental. Each step must leave the existing development and test environments usable, must be independently revertible, and must keep the GitLab pipeline green. Do not combine all four steps into one change.

## Repository context

The repository is `lightning-tip-cards`, normally checked out at `/Users/davidscheuch/Projects/tipcards`.

Relevant files:

- `compose.yml`
- `gitlab-ci/integration-and-e2e.yml`
- `gitlab-ci/live-check.yml`
- `scripts/docker/lnbits/.env`
- `scripts/docker/lnbits/init-lnbits.sh`
- `scripts/docker/lnbits/docker-entrypoint-initdb.d/restore.sh`
- `scripts/docker/lnbits/docker-entrypoint-initdb.d/sql/init.sql`
- `backend/.env`
- `backend/src/initEnv.ts`
- `e2e-playwright/.env`
- `playwright.config.ts`
- `e2e-cypress/.env`
- `e2e-cypress/cypress.config.ts`
- `package.json`

Current infrastructure:

- LNbits is pinned in `compose.yml` to `lnbits/lnbits:v1.5.3`.
- LNbits uses PostgreSQL 16.9 and the `FakeWallet` funding source.
- LNbits listens on port `4050`.
- Within the Compose network it is reachable directly as `http://lnbits:4050`.
- Through nginx it is reachable as `https://lnbits.tipcards.localhost`.
- The LNbits PostgreSQL database currently restores the committed dump at `scripts/docker/lnbits/docker-entrypoint-initdb.d/sql/init.sql` through `restore.sh`.
- The dump contains LNbits' internal schema, settings, extension metadata, users, wallets, keys, and historical payments. This couples the test setup to the internal schema of the pinned LNbits release.
- Required LNbits extensions are `withdraw` and `lnurlp`. Their versions in the current seed are `withdraw` 1.2.2 and `lnurlp` 1.3.0. Verify compatible versions against the pinned image and its extension API before implementing the bootstrap.
- All test wallets must remain satoshi-only. Do not assign a fiat currency. Fiat wallets make payment processing depend on external exchange-rate APIs and have already caused nondeterministic CI failures.

## Credential ownership and naming

The local and CI wallet credentials are deterministic, committed test fixtures. The migration must retain their current values. They must never be reused for hosted or production LNbits wallets.

Application configuration and the backend integration user wallet remain in `backend/.env` because that file is both the backend setup template and the GitLab environment-file contract:

```dotenv
LNBITS_ADMIN_KEY=8d4e4a151ae5446586ab283e4a89d98c
LNBITS_INVOICE_READ_KEY=f95447ee6414419b8ff3e415a4e359f8
LNBITS_ORIGIN_INTEGRATION=https://lnbits.tipcards.localhost
LNBITS_ADMIN_KEY_INTEGRATION_USER_WALLET=6da0c95636c44058bf1d09933476ac26
```

Do not rename the two application variables. Keeping their established names avoids changes to development, production, demo, and self-hosted backend environment files. The integration overrides use property-first names, with the wallet role appended where needed.

Keep each browser test runner's committed environment file self-contained. `e2e-playwright/.env` contains:

```dotenv
LNBITS_ORIGIN=https://lnbits.tipcards.localhost
LNBITS_ADMIN_KEY=8d4e4a151ae5446586ab283e4a89d98c
LNBITS_ADMIN_KEY_E2E_USER_WALLET=29f376ee8bec4503b241eb912666c397
```

`e2e-cypress/.env` contains its LNbits origin and the same E2E user-wallet key. This small duplication is intentional: it keeps environment loading explicit and avoids cross-loading backend or runner-specific files.

The canonical wallet contract is:

| Role | Target LNbits wallet name | Canonical variable | Initial balance |
| --- | --- | --- | --- |
| Application wallet | `Application` | `LNBITS_ADMIN_KEY` | 1,000,000 sats |
| Application wallet | `Application` | `LNBITS_INVOICE_READ_KEY` | Same wallet; no separate balance |
| Backend integration-test user wallet | `Integration User Wallet` | `LNBITS_ADMIN_KEY_INTEGRATION_USER_WALLET` | 2,000,000 sats |
| Cypress and Playwright user wallet | `E2E User Wallet` | `LNBITS_ADMIN_KEY_E2E_USER_WALLET` | 3,000,000 sats |

The migration replaces these ambiguous aliases:

| Existing variable | Replacement |
| --- | --- |
| `TEST_API_ORIGIN` | `API_ORIGIN_INTEGRATION` |
| `TEST_AUTH_ORIGIN` | `AUTH_ORIGIN_INTEGRATION` |
| Playwright `LNBITS_ADMIN_KEY_APPLICATION` | `LNBITS_ADMIN_KEY` in `e2e-playwright/.env` |
| `TEST_WALLET_LNBITS_ORIGIN` | `LNBITS_ORIGIN_INTEGRATION` |
| `TEST_WALLET_LNBITS_ADMIN_KEY` | `LNBITS_ADMIN_KEY_INTEGRATION_USER_WALLET` |
| Playwright `LNBITS_ADMIN_KEY_USER` | `LNBITS_ADMIN_KEY_E2E_USER_WALLET` |
| Cypress `LNBITS_ADMIN_KEY` | `LNBITS_ADMIN_KEY_E2E_USER_WALLET` |

The runner-specific files are test infrastructure, not a new deployment convention:

- Development and production backends continue to receive one aggregate backend environment file through the existing GitLab variables. Apply the documented integration-variable renames without changing their values in both `BACKEND_ENV_FILE_MAIN` and `BACKEND_ENV_FILE_DEVELOP`; the setup job validates these files against `backend/.env`.
- Demo containers continue to mount their existing `app-config/.env` as `/app/.env`.
- Self-hosted installations continue to configure the application wallet in the backend environment file.
- Deployed backends do not receive the browser-test user-wallet key.
- Do not add a wallet key to `E2E_ENV_FILE_LIVE_CHECK_MAIN` or `E2E_ENV_FILE_LIVE_CHECK_DEVELOP`. The live-check specs do not make LNbits wallet API requests.
- Do not update the separate DevOps repository's legacy `tip-cards-mvp` and `tip-cards-feature-complete` environment files; they configure older application images with their historical variable names.
- Current hosted wallet values and GitLab file-variable contents remain outside version control and must be updated separately.

## Bootstrap constraint for fixed keys

LNbits v1.5.3's wallet-creation APIs accept wallet names and types but do not accept caller-supplied wallet IDs, admin keys, or invoice/read keys. A pure API bootstrap therefore cannot recreate the committed credential values.

Use supported LNbits APIs for first installation, authentication, extensions, users, wallets, and balances. After a wallet has been created or located through the API, use the smallest explicit PostgreSQL reconciliation needed to set its `adminkey` and `inkey` to the committed fixture values. Scope the update to the exact wallet returned or resolved by the API; do not restore internal LNbits tables or recreate a general SQL seed.

This narrow database dependency is intentional. Document and test its schema assumptions against the pinned LNbits version. An LNbits version upgrade remains a separate change and must revalidate the reconciliation before changing the image tag.

Wallet IDs are not application contracts and do not need to retain their current values. The bootstrap must discover them through the API.

## Existing bootstrap prototype

The existing `scripts/docker/lnbits/init-lnbits.sh` is only a prototype. It currently:

- targets port `4020` instead of `4050`;
- performs first-install setup but is not idempotent;
- creates too few clearly defined wallet roles;
- generates credentials instead of applying the committed fixture contract;
- prints wallet keys;
- does not install and enable the required extensions;
- assumes `curl` and `jq` are available;
- does not replace the SQL restore in the active Compose setup.

Do not treat that script as production-ready. It may be replaced if a small TypeScript or shell implementation is clearer.

## General implementation rules

- Read the current repository state before editing because dependency versions and CI configuration may have changed since this guide was written.
- Preserve unrelated worktree changes.
- Prefer a small, readable, idempotent implementation over a generic provisioning framework.
- Keep the committed fixture values unchanged unless a separate deliberate credential rotation is approved.
- Never print wallet keys, passwords, or access tokens in normal logs. It is acceptable to print wallet names and readiness messages.
- Never use the committed fixture credentials against hosted or production LNbits instances.
- Pin extension versions or otherwise make their resolution deterministic.
- Fail fast with an actionable message when LNbits returns an unexpected response.
- Do not hide setup failures behind retries. Retry only bounded readiness operations and API calls known to be temporarily unavailable during startup.
- Do not modify hosted LNbits instances or rotate hosted wallet credentials. This migration provisions only local development and CI test environments.
- Do not upgrade packages or LNbits as part of this migration.
- Do not proceed to the next prompt in the same change.
- Run focused verification first. Run `npm run typecheck` and `npm run lint` once after completing each substantial step. Avoid repeatedly running full browser suites during implementation.
- When asked for a commit message, use Conventional Commits and include `Refs: projects#2288`.

## Prompt 1: Clarify committed LNbits test configuration

```text
Implement step 1 of the LNbits bootstrap migration described in docs/development/lnbits-api-bootstrap-migration.md.

Goal: establish the committed credential contract and clear wallet-role names without changing wallet values, activating a bootstrap, changing Compose, or removing the SQL seed.

Required behavior:

1. Keep LNBITS_ADMIN_KEY and LNBITS_INVOICE_READ_KEY with their current values in backend/.env. They remain the application wallet contract for local, development, production, demo, and self-hosted backends.
2. Rename the backend integration variables according to the mapping above without changing their values.
3. Update backend integration-test configuration to use the renamed variables while preserving all existing fallbacks.
4. Update Playwright's own environment file to use LNBITS_ADMIN_KEY for the application wallet and LNBITS_ADMIN_KEY_E2E_USER_WALLET for the user wallet. Keep its LNBITS_ORIGIN in that file.
5. Update Cypress's own environment file to use LNBITS_ADMIN_KEY_E2E_USER_WALLET instead of interpreting its user-wallet key as LNBITS_ADMIN_KEY. Keep its LNBITS_ORIGIN in that file and preserve the existing live-check overrides through e2e-cypress/.env.local.
6. Keep the E2E user-wallet value identical in the Playwright and Cypress environment files. Add no shared environment loader or cross-file parsing for this small fixture duplication.
7. Update focused tests and development documentation for the new variable names. Do not change application configuration values or the application-wallet contract.

Verify the backend integration configuration, Playwright configuration, Cypress configuration, lint, typecheck, and git diff. Do not run full browser suites unless focused verification exposes a runtime concern.

Do not implement the bootstrap, modify Compose service ordering, remove SQL restore files, upgrade packages, commit, or push in this step.
```

Suggested commit message:

```text
refactor(config): clarify integration test configuration

Refs: projects#2288
```

## Prompt 2: Build an idempotent bootstrap without activating it

```text
Implement step 2 of the LNbits bootstrap migration described in docs/development/lnbits-api-bootstrap-migration.md. Step 1 must already provide the final committed credential names and values. Do not activate the bootstrap in Compose or GitLab CI yet, and do not remove the SQL seed.

Goal: create a complete, idempotent bootstrap command for the currently pinned LNbits test container while the existing SQL restore remains active.

Before editing, inspect the pinned LNbits v1.5.3 OpenAPI document and the relevant wallet schema available from the running container or pinned source. Do not guess endpoint or database shapes. Inspect scripts/docker/lnbits/init-lnbits.sh, but treat it as an outdated prototype that may be replaced.

The bootstrap must:

1. Accept an explicit LNbits base URL, defaulting only to the direct Compose-network URL http://lnbits:4050 when appropriate for its execution environment.
2. Wait for LNbits readiness using a bounded timeout and clear errors.
3. Complete first installation on an empty instance and authenticate on subsequent runs using an explicit local/CI bootstrap identity. Do not use or modify hosted credentials.
4. Install and enable deterministic, compatible versions of withdraw and lnurlp.
5. Provision three currency-neutral wallets named Application, Integration User Wallet, and E2E User Wallet with minimum balances of 1,000,000, 2,000,000, and 3,000,000 sats respectively.
6. Reuse existing users and wallets when rerun. Identify them through stable API-visible properties and never duplicate wallets.
7. Ensure balances reach the required minimum without resetting higher balances or repeatedly adding the initial amount. Confirm the balance unit against the pinned implementation.
8. Read the application and integration user-wallet keys from backend/.env and the E2E user-wallet key from e2e-playwright/.env. Verify that e2e-cypress/.env contains the same E2E user-wallet value. Fail if a required value is absent or duplicated values differ.
9. Use the LNbits APIs wherever supported. Reconcile only each resolved wallet's adminkey and inkey through the minimal pinned-schema PostgreSQL operation required to preserve the committed values.
10. Verify after reconciliation that every wallet exposes the expected key through an authenticated API response. Never print the values.

Choose the simplest implementation that runs reliably in the existing Docker-based CI environment. If using TypeScript, prefer native fetch and existing project tooling. If using shell, explicitly provide all required tools and robust JSON parsing. Do not add a large dependency.

Add a package.json command such as lnbits:bootstrap and focused automated tests for pure parsing, configuration, and idempotency logic where practical. Verify manually against both an empty LNbits database and the currently SQL-seeded database. On the second invocation, prove that no user or wallet is duplicated, no balance is added again, and the fixed keys remain unchanged.

Do not alter Compose service ordering, GitLab CI activation, consumer environment loading, or remove the SQL dump in this step. Do not commit or push unless explicitly asked.
```

Suggested commit message:

```text
feat(dev): add deterministic LNbits bootstrap

Refs: projects#2288
```

## Prompt 3: Activate bootstrapping in Compose and GitLab CI

```text
Implement step 3 of the LNbits bootstrap migration described in docs/development/lnbits-api-bootstrap-migration.md. Steps 1 and 2 must already be complete: consumers use the final committed credential contract and an idempotent bootstrap provisions wallets with those values.

Goal: make clean local test environments and all relevant GitLab integration/end-to-end jobs use an empty LNbits database followed by the bootstrap. Retain the SQL dump and restore script as an inactive rollback path during this step.

Required startup order:

lnbits-postgres -> lnbits -> lnbits-bootstrap -> backend/frontend -> tests

Implementation requirements:

1. Stop mounting scripts/docker/lnbits/docker-entrypoint-initdb.d into lnbits-postgres in the active test/development path so LNbits owns and migrates its schema.
2. Add a one-shot bootstrap service or an equally explicit two-phase startup. It must run on the tipcards-localhost network and exit successfully only when extensions, wallets, balances, and fixed credentials are ready.
3. Ensure backend test and development services do not start before bootstrap success. Credentials are already committed, but LNbits must contain the matching wallets before consumers use them.
4. Keep frontend startup independent unless it genuinely requires bootstrap completion.
5. Update test-backend-integration, test-e2e-playwright, and test-e2e-cypress in gitlab-ci/integration-and-e2e.yml to use the same bootstrap path.
6. Preserve the optimization where backend integration does not start the frontend.
7. Preserve the pinned Playwright and Cypress images.
8. Add concise bootstrap failure diagnostics without printing credentials.
9. Keep the SQL dump and restore script in the repository but inactive. Document the minimal rollback needed to reactivate them.

Verification:

- Start from genuinely empty application and LNbits data directories using a temporary DATA_DIR. Never delete a developer's existing data directory.
- Prove the bootstrap completes and a second docker compose up is idempotent.
- Confirm the three wallet roles have their expected fixed keys, at least their required balances, and no fiat currency without printing key values.
- Run the complete backend integration suite once.
- Run the two Playwright funding files that exercise invoice/LNURL payments and at least the Playwright clone test that uses the funding helper. Run the full Playwright suite only if focused tests expose cross-file state concerns.
- Start Cypress far enough to prove browser and application startup; run more only if the infrastructure change affects Cypress behavior.
- Run npm run typecheck and npm run lint once.
- Restore the developer's original Compose stack afterward.

Do not delete the SQL dump, restore script, save command, or committed fixture credentials yet. Do not proceed to step 4. Do not commit or push unless explicitly asked.
```

Suggested commit message:

```text
ci: bootstrap deterministic LNbits test data

Refs: projects#2288
```

## Prompt 4: Remove the legacy SQL seed

```text
Implement step 4 of the LNbits bootstrap migration described in docs/development/lnbits-api-bootstrap-migration.md. Begin only after the bootstrapped Compose and GitLab pipeline from step 3 have passed reliably on clean environments.

Goal: remove the inactive full-database seed while retaining the committed application and test user-wallet credential contract and the narrow, documented key reconciliation.

Remove:

1. scripts/docker/lnbits/docker-entrypoint-initdb.d/restore.sh.
2. scripts/docker/lnbits/docker-entrypoint-initdb.d/sql/init.sql.
3. The now-unused LNbits docker-entrypoint-initdb.d directory if empty.
4. docker:save-lnbits-database-to-sql from package.json.
5. Superseded credential aliases, compatibility branches, old wallet names, and obsolete migration commands.
6. The old scripts/docker/lnbits/init-lnbits.sh if step 2 replaced it.

Retain:

- LNBITS_ADMIN_KEY, LNBITS_INVOICE_READ_KEY, LNBITS_ORIGIN_INTEGRATION, and LNBITS_ADMIN_KEY_INTEGRATION_USER_WALLET in backend/.env;
- LNBITS_ADMIN_KEY_E2E_USER_WALLET in the committed Playwright and Cypress environment files;
- the pinned LNbits image and deterministic extension versions;
- the satoshi-only wallet requirement;
- bounded readiness handling;
- the minimal pinned-schema key reconciliation and its focused tests;
- clear bootstrap diagnostics that never expose credentials;
- the optimized integration and pinned browser-image CI setup.

Update documentation to explain the committed test-fixture contract, wallet roles, minimum balances, idempotent startup, and non-destructive temporary-DATA_DIR rebuild workflow. Remove instructions for dumping or restoring LNbits PostgreSQL internals. State that test wallets intentionally have no fiat currency.

Final verification must start from an empty temporary DATA_DIR:

1. Start the full test stack and confirm bootstrap success.
2. Run the complete backend integration suite once.
3. Run the complete Playwright suite once because this is the final removal step.
4. Run the affected Cypress payment/authentication coverage, or the complete suite if reasonably fast.
5. Run npm run typecheck and npm run lint.
6. Confirm no active references remain to the SQL restore, save command, old wallet IDs, old wallet names, or superseded variable names.
7. Confirm the committed fixture values are present only in the documented environment files, duplicated E2E user-wallet values match, and no values appear in logs or artifacts.
8. Restore the developer's original Compose stack afterward.

Keep the final diff reviewer-focused. Do not introduce package or LNbits upgrades. Do not commit or push unless explicitly asked.
```

Suggested commit message:

```text
chore(dev): remove legacy LNbits database seed

Refs: projects#2288
```

## Expected final state

After all four prompts are complete:

- PostgreSQL starts empty and is migrated by LNbits itself.
- An idempotent bootstrap provisions pinned extensions and the three required wallet roles.
- Supported LNbits APIs handle provisioning; a minimal, pinned-schema PostgreSQL reconciliation preserves the committed wallet keys that the API cannot accept.
- `backend/.env` remains the canonical application-wallet configuration and deployment template.
- Each existing environment file remains self-contained. The small E2E user-wallet duplication between Playwright and Cypress is intentional and checked for consistency.
- Development, production, demo, and self-hosted backend environment-file structures remain unchanged.
- Wallets have no fiat currency, so payment tests do not depend on public exchange-rate providers.
- Compose and GitLab CI enforce bootstrap completion before dependent services start.
- No full LNbits internal-schema dump or database-save command remains in version control.
