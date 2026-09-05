# Migrating the LNbits Test Seed from SQL to an API Bootstrap

This guide contains four prompts for migrating the local and CI LNbits setup from a committed PostgreSQL dump to an idempotent API-driven bootstrap. Give Codex one prompt at a time, review and commit the result, and only then continue with the next prompt.

The migration should be incremental. Each step must leave the existing development and test environments usable, must be independently revertible, and must keep the GitLab pipeline green. Do not combine all four steps into one change.

## Repository context

The repository is `lightning-tip-cards`, normally checked out at `/Users/davidscheuch/Projects/tipcards`.

Relevant files:

- `compose.yml`
- `gitlab-ci/integration-and-e2e.yml`
- `scripts/docker/lnbits/.env`
- `scripts/docker/lnbits/init-lnbits.sh`
- `scripts/docker/lnbits/docker-entrypoint-initdb.d/restore.sh`
- `scripts/docker/lnbits/docker-entrypoint-initdb.d/sql/init.sql`
- `backend/.env`
- `backend/.env.integrationTest`
- `backend/src/initEnv.ts`
- `e2e-playwright/.env`
- `playwright.config.ts`
- `package.json`

Current infrastructure:

- LNbits is pinned in `compose.yml` to `lnbits/lnbits:v1.5.3`.
- LNbits uses PostgreSQL 16.9 and the `FakeWallet` funding source.
- LNbits listens on port `4050`.
- Within the Compose network it is reachable directly as `http://lnbits:4050`.
- Through nginx it is reachable as `https://lnbits.tipcards.localhost`.
- The LNbits PostgreSQL database currently restores the committed dump at `scripts/docker/lnbits/docker-entrypoint-initdb.d/sql/init.sql` through `restore.sh`.
- The dump contains LNbits' internal schema, settings, extension metadata, users, wallets, keys, and historical payments. This couples the test setup to the internal schema of the pinned LNbits release.
- Required LNbits extensions are `withdraw` and `lnurlp`. Their versions in the current seed are `withdraw` 1.2.2 and `lnurlp` 1.3.0. Before hardcoding these versions in a new bootstrap, verify them against the currently pinned LNbits image and its extension API.
- All test wallets must remain satoshi-only. Do not assign a fiat currency. A fiat currency such as USD makes payment processing depend on external exchange-rate APIs and has already caused nondeterministic CI failures.

Current wallet roles and credentials:

| Role | Current wallet | Current key consumer | Initial balance |
| --- | --- | --- | --- |
| Application wallet | `develop`, ID `171199a3d97a43c0b5fe811e32d47012` | `LNBITS_ADMIN_KEY`, `LNBITS_INVOICE_READ_KEY`, and Playwright's `LNBITS_ADMIN_KEY_APPLICATION` | 1,000,000 sats |
| Backend integration-test payer | `Wallet2`, ID `161dee222082452baef5700de7553b3f` | `TEST_WALLET_LNBITS_ADMIN_KEY` | 2,000,000 sats |
| Playwright user wallet | `Wallet3`, ID `563486e6cac2468b8e69293d1e77832d` | `LNBITS_ADMIN_KEY_USER` | 3,000,000 sats |
| Superuser default wallet | `LNbits wallet`, ID `cf5830a4ca104772ae659467842c0a4f` | Not currently used by application tests | No required balance |

The current IDs and keys are fixtures, not contracts. The API bootstrap may generate replacements. The role names and environment-variable contracts matter; the old literal IDs and keys do not.

Configuration behavior that must be considered:

- `backend/src/initEnv.ts` loads root and backend `.env` files, then their `.env.local` counterparts with override enabled. Integration tests additionally load `.env.integrationTest`.
- `playwright.config.ts` currently loads only `e2e-playwright/.env`.
- Backend and Playwright credential names differ, even when they refer to the same application wallet.
- Compose parses service-level `env_file` declarations before containers start. A bootstrap container cannot generate a Compose `env_file` and expect an already-created backend container to receive it automatically.
- A practical solution is a generated, ignored runtime file such as `.env.lnbits.local`. Application code can load that file after committed defaults. Alternatively, run Compose in two phases and create backend containers only after the file exists. Keep the chosen design explicit and simple.
- `.gitignore` already ignores `*.local`, but verify that the exact generated filename is ignored.

The existing `scripts/docker/lnbits/init-lnbits.sh` is only a prototype. It currently:

- targets port `4020` instead of `4050`;
- performs first-install setup but is not idempotent;
- creates too few clearly defined wallet roles;
- generates credentials without making them available to the backend and test runners;
- does not install and enable the required extensions;
- assumes `curl` and `jq` are available;
- does not replace the SQL restore in the active Compose setup.

Do not treat that script as production-ready. It may be replaced rather than incrementally patched if a small TypeScript or shell implementation is clearer.

The Satoshi Business Suite repository is not a complete model for this migration. Its local `compose.yml` only starts PostgreSQL. Its application tests use LNbits webhook fixtures, while the DevOps end-to-end tests use already-provisioned hosted LNbits wallets. It therefore avoids local LNbits seeding rather than demonstrating a reusable local LNbits bootstrap.

## General implementation rules

- Read the current repository state before editing because dependency versions and CI configuration may have changed since this guide was written.
- Preserve unrelated worktree changes.
- Prefer a small, readable, idempotent implementation over a generic provisioning framework.
- Never commit generated credentials, access tokens, local database data, or `.env.lnbits.local`.
- Never print secrets in normal CI logs. It is acceptable to print wallet names and readiness messages.
- Pin extension versions or otherwise make their resolution deterministic.
- Fail fast with an actionable message when LNbits returns an unexpected response.
- Do not hide setup failures behind retries. Retry only bounded readiness operations and API calls known to be temporarily unavailable during startup.
- Do not modify production or hosted LNbits configuration. This migration is for local development and CI test environments.
- Do not upgrade packages or LNbits as part of this migration.
- Do not proceed to the next prompt in the same change.
- Run focused verification first. Run `npm run typecheck` and `npm run lint` once after completing each substantial step. Avoid repeatedly running full browser suites during implementation.
- When asked for a commit message, use Conventional Commits and include `Refs: projects#2288`.

## Prompt 1: Build an idempotent LNbits bootstrap without activating it

```text
Implement step 1 of the LNbits API-bootstrap migration described in docs/development/lnbits-api-bootstrap-migration.md.

Goal: create a complete, idempotent bootstrap command for the currently pinned LNbits test container, but do not wire it into compose.yml or GitLab CI yet. The existing SQL restore must remain the active setup after this step.

Before editing, inspect the pinned LNbits v1.5.3 OpenAPI document or source available from the running container. Do not guess endpoint shapes. Inspect the existing scripts/docker/lnbits/init-lnbits.sh, but treat it as an outdated prototype that may be replaced.

The bootstrap must:

1. Accept an explicit LNbits base URL, defaulting only to the direct Compose-network URL http://lnbits:4050 when that is appropriate for its execution environment.
2. Wait for LNbits readiness using a bounded timeout and clear error messages.
3. Complete first installation on an empty instance and authenticate on subsequent runs.
4. Install and enable the pinned `withdraw` and `lnurlp` extensions required by Tipcards. Verify the compatible extension versions against the pinned image instead of blindly trusting this guide.
5. Provision three clearly named, currency-neutral wallet roles:
   - application wallet: 1,000,000 sats;
   - backend integration-test payer: 2,000,000 sats;
   - Playwright user wallet: 3,000,000 sats.
6. Reuse existing users and wallets when rerun. Identify resources by stable, explicit names or another documented API-visible property. Never duplicate wallets or repeatedly add the initial balance.
7. Ensure balances reach the required minimum without resetting legitimate higher balances. Confirm the unit expected by the LNbits admin balance API from the pinned implementation.
8. Write the generated credential contract atomically to an ignored `.env.lnbits.local` file at the repository root. It must contain at least:
   LNBITS_ADMIN_KEY=<application admin key>
   LNBITS_INVOICE_READ_KEY=<application invoice/read key>
   TEST_WALLET_LNBITS_ADMIN_KEY=<integration payer admin key>
   LNBITS_ADMIN_KEY_APPLICATION=<application admin key>
   LNBITS_ADMIN_KEY_USER=<Playwright user admin key>
9. Give the file restrictive permissions where supported.
10. Avoid printing access tokens or wallet keys to logs.

Choose the simplest implementation that runs reliably in the existing Docker-based CI environment. If using TypeScript, prefer native fetch and existing project tooling. If using shell, explicitly provide all required tools in the execution image and use robust JSON parsing. Do not add a large dependency for this.

Add a package.json command with a clear name such as `lnbits:bootstrap`. Add focused automated tests for pure parsing/configuration/idempotency logic where practical. Verify the bootstrap manually against both:

- an empty LNbits database;
- the currently SQL-seeded LNbits database.

On the second invocation, prove that no duplicate users/wallets are created and no balance is added again. Do not alter compose.yml, GitLab CI, backend environment loading, Playwright environment loading, or remove the SQL dump in this step.

At the end, report files changed, the API resources provisioned, the exact focused verification performed, and any pinned API assumptions. Do not commit or push unless explicitly asked.
```

Suggested commit message:

```text
feat(dev): add idempotent LNbits API bootstrap

Refs: projects#2288
```

## Prompt 2: Load generated credentials while retaining current fallbacks

```text
Implement step 2 of the LNbits API-bootstrap migration described in docs/development/lnbits-api-bootstrap-migration.md. Step 1 must already provide an idempotent bootstrap command that writes an ignored root-level `.env.lnbits.local` file. Do not activate the bootstrap in Compose or GitLab CI yet, and do not remove the SQL seed.

Goal: teach every local and test consumer to use the generated wallet credentials when `.env.lnbits.local` exists, while preserving the current committed credentials as temporary fallbacks. Both the old SQL-seeded path and the new API-bootstrapped path must work after this step.

Required behavior:

1. Update backend environment loading so root `.env.lnbits.local` is loaded after the existing committed and local environment files, with generated LNbits values taking precedence. Preserve the established reading order in backend/src/initEnv.ts and keep the implementation explicit.
2. Update Playwright configuration so it loads the same root `.env.lnbits.local` after e2e-playwright/.env, also with override behavior. Do not duplicate credential files.
3. Confirm that these mappings work:
   - backend `LNBITS_ADMIN_KEY` and Playwright `LNBITS_ADMIN_KEY_APPLICATION` point to the same application wallet;
   - backend `LNBITS_INVOICE_READ_KEY` is the application wallet's invoice/read key;
   - backend integration tests use `TEST_WALLET_LNBITS_ADMIN_KEY`;
   - Playwright uses `LNBITS_ADMIN_KEY_USER` for its payer/user wallet.
4. Retain the committed keys in backend/.env, backend/.env.integrationTest, and e2e-playwright/.env for now. Clearly mark them as a temporary compatibility fallback if a concise comment is appropriate.
5. Verify `.env.lnbits.local` is ignored and cannot accidentally be committed.
6. Fail early with clear messages when a required credential is missing. Never log credential values.

Verification must cover both modes:

- Without `.env.lnbits.local`, existing SQL-seeded focused integration and Playwright startup must still work.
- With `.env.lnbits.local` produced by the bootstrap, run a focused backend integration path and a focused Playwright payment path using the generated credentials.
- Run `npm run typecheck` and `npm run lint` once after implementation.

Do not modify Compose service ordering, GitLab CI jobs, SQL restore files, or package versions in this step. Do not proceed to step 3. At the end, report both fallback and generated-credential verification separately. Do not commit or push unless explicitly asked.
```

Suggested commit message:

```text
feat(config): support generated LNbits test credentials

Refs: projects#2288
```

## Prompt 3: Activate API bootstrapping in Compose and GitLab CI

```text
Implement step 3 of the LNbits API-bootstrap migration described in docs/development/lnbits-api-bootstrap-migration.md. Steps 1 and 2 must already be complete: an idempotent bootstrap command writes `.env.lnbits.local`, and backend/Playwright can load it while retaining committed credential fallbacks.

Goal: make clean local test environments and all relevant GitLab integration/end-to-end jobs use an empty LNbits database followed by the API bootstrap. Retain the SQL dump and fallback credentials as an inactive rollback path during this step.

Required startup order:

lnbits-postgres -> lnbits -> lnbits-bootstrap -> backend/frontend -> tests

Implementation requirements:

1. Stop mounting scripts/docker/lnbits/docker-entrypoint-initdb.d into lnbits-postgres in the active test/development path, so LNbits owns and migrates its schema.
2. Add a one-shot bootstrap service or an equally explicit two-phase startup. It must run on the `tipcards-localhost` network, wait for LNbits health, execute the step-1 bootstrap, write `.env.lnbits.local`, and exit successfully only when extensions, wallets, balances, and credentials are ready.
3. Ensure backend test and development services are not created or started before generated credentials exist. Remember that Compose reads `env_file` values before container startup. Prefer having application code load the generated mounted file at runtime, as established in step 2, rather than relying on dynamic Compose interpolation.
4. Keep frontend startup independent unless it genuinely needs bootstrap completion.
5. Update all relevant jobs in gitlab-ci/integration-and-e2e.yml:
   - test-backend-integration;
   - test-e2e-playwright;
   - test-e2e-cypress.
   They must use the same deterministic bootstrap path.
6. Preserve the existing optimization where the backend integration job does not start the frontend service.
7. Preserve the pinned Playwright and Cypress images.
8. Make cleanup remove generated runtime credentials from the job workspace even after failure. Never upload them as artifacts or cache them.
9. Extend failure diagnostics with concise bootstrap logs, while ensuring secrets are not printed.
10. Keep the SQL dump and restore script in the repository but inactive. Document the rollback command or minimal diff needed to reactivate them.

Verification:

- Start from genuinely empty application and LNbits data directories. Use a temporary DATA_DIR rather than deleting a developer's existing `data/` directory.
- Prove the bootstrap completes and `.env.lnbits.local` contains all required variable names without printing values.
- Prove a second `docker compose up` is idempotent.
- Confirm the three wallet roles have at least their required balances and no fiat currency.
- Run the complete backend integration suite once.
- Run the two Playwright funding files that exercise invoice/LNURL payments and at least the Playwright clone test that uses the funding helper. Run the full Playwright suite only if focused tests expose cross-file state concerns.
- Start the Cypress run far enough to prove browser and application startup; run more only if the infrastructure change affects Cypress behavior.
- Run `npm run typecheck` and `npm run lint` once.
- Restore the developer's original Compose stack afterward.

Do not delete the SQL dump, restore script, save command, or committed fallback credentials yet. Do not proceed to step 4. Do not commit or push unless explicitly asked.
```

Suggested commit message:

```text
ci: bootstrap LNbits test data through its API

Refs: projects#2288
```

## Prompt 4: Remove the legacy SQL seed and credential fallbacks

```text
Implement step 4 of the LNbits API-bootstrap migration described in docs/development/lnbits-api-bootstrap-migration.md. Only begin after the API-bootstrapped Compose and GitLab pipeline from step 3 have passed reliably on clean environments.

Goal: remove the inactive SQL-based LNbits seed and temporary hardcoded credential fallbacks, leaving one documented and deterministic setup path.

Remove:

1. scripts/docker/lnbits/docker-entrypoint-initdb.d/restore.sh.
2. scripts/docker/lnbits/docker-entrypoint-initdb.d/sql/init.sql.
3. The now-unused LNbits docker-entrypoint-initdb.d directory if empty.
4. `docker:save-lnbits-database-to-sql` from package.json.
5. Hardcoded LNbits wallet keys from backend/.env, backend/.env.integrationTest, and e2e-playwright/.env once every consumer receives generated credentials.
6. Any compatibility comments, fallback branches, or obsolete commands introduced only for the transition.
7. The old scripts/docker/lnbits/init-lnbits.sh if step 1 replaced it with another implementation.

Retain:

- the pinned LNbits image and deterministic extension versions;
- the satoshi-only wallet requirement;
- bounded readiness handling;
- the ignored generated `.env.lnbits.local` contract;
- clear bootstrap failure diagnostics that do not expose secrets;
- the optimized integration and pinned browser-image CI setup.

Update documentation:

- Explain how a developer starts the environment from empty data.
- Explain that the bootstrap is idempotent and when it reruns.
- List the wallet roles and required balances, but never document generated keys.
- Explain how to rebuild only LNbits using a temporary DATA_DIR or another non-destructive workflow.
- Remove instructions for dumping or restoring LNbits PostgreSQL internals.
- State that tests intentionally use wallets without fiat currency to avoid external exchange-rate dependencies.

Final verification must start from an empty temporary DATA_DIR and must not rely on an old generated credential file:

1. Start the full test stack and confirm bootstrap success.
2. Run the complete backend integration suite once.
3. Run the complete Playwright suite once because this is the final removal step.
4. Start Cypress and run the affected payment/authentication coverage, or the complete suite if it remains reasonably fast.
5. Run `npm run typecheck` and `npm run lint`.
6. Confirm `rg` finds no active references to the removed SQL restore, save command, old fixed wallet IDs, or old fixed wallet keys.
7. Confirm generated secrets are ignored, absent from `git diff`, and absent from test artifacts.
8. Restore the developer's original Compose stack afterward.

Keep the final diff reviewer-focused. Do not introduce package or LNbits upgrades. At the end, report deleted legacy files, the surviving bootstrap contract, all verification results, and any intentionally retained migration artifact. Do not commit or push unless explicitly asked.
```

Suggested commit message:

```text
chore(dev): remove legacy LNbits database seed

Refs: projects#2288
```

## Expected final state

After all four prompts are complete:

- PostgreSQL starts empty and is migrated by LNbits itself.
- A single idempotent bootstrap provisions pinned extensions and the required wallet roles through supported LNbits interfaces.
- Wallets have no fiat currency and therefore payment tests do not depend on public exchange-rate providers.
- Generated credentials are written atomically to one ignored local file and loaded at runtime by backend and browser tests.
- Compose and GitLab CI enforce bootstrap completion before dependent services start.
- No LNbits internal-schema dump, fixed wallet key, or database-save command remains in version control.
