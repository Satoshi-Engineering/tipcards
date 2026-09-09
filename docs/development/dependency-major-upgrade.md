# Dependency major upgrade findings

Date investigated: 2026-09-04

> Preserve or commit this file before reverting the experimental working tree. It is itself uncommitted at the time of writing and would otherwise be deleted by a complete revert.

## Purpose

This note records the findings from an experimental upgrade of all major dependencies reported by `npm-check-updates`. The experiment was intentionally stopped before completing builds and test suites so that the upgrades can be split into small, reviewable changes.

The package graph was upgraded once as a combined experiment. Therefore, the classifications below identify packages that did or did not expose changes during that experiment; they are not a substitute for validating each final upgrade branch independently.

## Handoff instructions for a fresh Codex session

Assume the repository starts from a clean checkout in which **all experimental upgrade changes described in this document have been reverted**. In particular:

- `package.json` and `package-lock.json` contain the original dependency versions.
- `.nvmrc` contains `v24.13.0`.
- There is no `backend/src/api/routeParameters.ts` helper.
- The Express, JOSE, bip32, Zod, ESLint, and test compatibility edits described below do not exist.
- Passing lint and typecheck results from the experiment do not prove that the clean checkout or any smaller future upgrade batch passes.

Before changing anything:

1. Read this entire document.
2. Confirm the working tree is clean with `git status --short`.
3. Recheck current package releases and peer/engine requirements because the candidate versions in this document are a snapshot from 2026-09-04.
4. Inspect the current files before applying any recorded migration idea; do not blindly replay the experimental diff.
5. Keep changes reviewer-focused and do not combine the first dependency batch with the focused migrations.

For the first upgrade branch, update only the packages in [First upgrade run](#first-upgrade-run-no-application-code-changes-observed). Do not upgrade Express, JOSE, bip32, Zod, ESLint, Vitest, Vite, Cypress, jsdom, Tailwind, TypeScript, or Node typings in that branch.

## Project baseline

- The frontend uses Vue 3, Vue Router, Pinia, Vite, Vitest, and Tailwind CSS.
- The backend uses Express, tRPC, Zod, and JOSE.
- The repository is ESM (`"type": "module"`).
- `.nvmrc` originally pinned Node `v24.13.0`.
- The local process used during the experiment was Node `v24.20.0` with npm `11.19.0`.
- TypeScript was pinned to `~5.9.3`.
- Tailwind has a substantial TypeScript configuration with custom colors, fonts, screens, animations, utilities, and a custom plugin.
- Vite has custom normal, maintenance, and library build modes and uses `rollupOptions`.
- Cypress uses the webpack preprocessor with TypeScript path aliases and `ts-loader`.

## Initial major updates reported by npm-check-updates

| Package | From | Candidate |
| --- | --- | --- |
| `@cypress/webpack-preprocessor` | 7.1.2 | 8.0.0 |
| `@dbml/core` | 3.14.1 | 10.1.1 |
| `@pinia/testing` | 1.0.3 | 2.0.1 |
| `@types/express` | 4.17.25 | 5.0.6 |
| `@types/jsdom` | 21.1.7 | 30.0.0 |
| `@types/node` | 24.13.3 | 26.4.1 |
| `@vueuse/core` | 13.9.0 | 14.4.0 |
| `bip32` | 4.0.0 | 5.0.1 |
| `clipboardy` | 4.0.0 | 5.3.2 |
| `cypress` | 15.21.1 | 16.0.0 |
| `eslint` | 9.39.5 | 10.10.0 |
| `eslint-plugin-cypress` | 5.3.0 | 7.0.1 |
| `express` | 4.22.2 | 5.2.1 |
| `jose` | 5.10.0 | 6.2.11 |
| `jsdom` | 26.1.0 | 30.0.1 |
| `pinia` | 3.0.4 | 4.0.3 |
| `start-server-and-test` | 2.1.5 | 3.0.12 |
| `tailwindcss` | 3.4.19 | 4.3.3 |
| `typescript` | 5.9.3 | 7.0.2 |
| `vite` | 7.3.6 | 8.2.2 |
| `vitest` | 3.2.7 | 5.0.0 |
| `vue-router` | 4.6.4 | 5.3.1 |
| `zod` | 3.25.76 | 4.5.4 |

## First upgrade run: no application-code changes observed

These packages did not expose application-code changes during the combined install and typecheck experiment. They are the recommended first batch.

- `@vueuse/core` 13 to 14
- `@dbml/core` 3 to 10
- `clipboardy` 4 to 5
- `start-server-and-test` 2 to 3
- `vue-router` 4 to 5
- The Pinia group, upgraded together:
  - `pinia` 3 to 4
  - `@pinia/testing` 1 to 2
  - add `@vue/devtools-api` 8 as an explicit companion dependency

Important qualifications:

- Vue Router 5 states that applications using manually declared routes, as this project does, have no breaking migration steps. Its major change primarily integrates file-based routing functionality from `unplugin-vue-router`.
- Pinia 4 is ESM-only, which matches this repository. Pinia 4 also requires `@vue/devtools-api` to be installed alongside it.
- `@dbml/core`, `clipboardy`, and `start-server-and-test` were typechecked only where applicable. Their schema-generation, clipboard task, and process-orchestration behavior still need focused smoke checks.
- These packages were not installed and tested in isolation. The final first-batch branch must still run the validation listed below.

### Exact first-batch scope from the clean baseline

Apply these package changes and no others:

| Package | Clean-baseline version | First-batch target |
| --- | --- | --- |
| `@vueuse/core` | `^13.9.0` | `^14.4.0` |
| `@dbml/core` | `^3.14.1` | `^10.1.1` |
| `clipboardy` | `^4.0.0` | `^5.3.2` |
| `start-server-and-test` | `^2.1.5` | `^3.0.12` |
| `vue-router` | `4.6.4` | `5.3.1` |
| `pinia` | `^3.0.4` | `^4.0.3` |
| `@pinia/testing` | `^1.0.3` | `^2.0.1` |
| `@vue/devtools-api` | not declared | add `^8.1.5` to dependencies |

Preserve the repository's existing exact-versus-caret style shown above. Regenerate `package-lock.json` with npm after editing `package.json`.

Review the resulting lockfile to ensure npm did not pull any of the deliberately excluded direct-package majors into `package.json`. Transitive dependency changes are expected.

### First-batch validation

After the batch is complete, run validation once:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test-units`
4. `npm run frontend-build`
5. `npm run backend-build`
6. Run `npm run drizzle-update-schema` or the smallest non-destructive schema-generation check to exercise `@dbml/core`; review generated diffs and do not keep unrelated generated changes.
7. Exercise the Cypress clipboard task or its smallest available test to verify clipboardy 5 at runtime.

If a first-batch package causes source changes, remove it from the batch and move it into its own focused upgrade rather than expanding the batch.

## Upgrade separately with focused code changes

### Express 5 and its types

Upgrade together:

- `express` 4 to 5
- `@types/express` 4 to 5

Observed impact:

- Express 5 types expose named route parameters as `string | string[]` because wildcard parameters can be arrays.
- This produced type errors throughout backend routes and middleware wherever `req.params.cardHash`, `req.params.setId`, and similar values were passed to functions expecting a string.
- The experiment introduced a `getRouteParameter()` boundary helper that verifies a route parameter is a single string.

Runtime migration points to review even if typechecking passes:

- Changed string route-pattern syntax for wildcards and optional parameters.
- Changed `req.query`, `req.body`, and query-parser behavior.
- Changed static-file and MIME defaults.
- Automatic forwarding of rejected async-handler promises.

No wildcard or optional string route patterns and no writes to `req.query` were found during the initial source scan.

Reference: <https://expressjs.com/en/guide/migrating-5/>

### JOSE 6

Observed impact:

- `KeyLike` is no longer exported.
- JWT production types and unit-test mocks need to use JOSE's exported `CryptoKey` type.
- Mocked verification results need to match the stricter JOSE 6 result types.

Files affected during the experiment included the JWT issuer, validator, key-pair type, and their unit tests.

### bip32 5

Observed impact:

- Public keys, private keys, and signatures are typed as `Uint8Array` instead of Node `Buffer`.
- Calls such as `signature.toString('hex')` no longer work directly.
- The existing public API can be preserved by converting values with `Buffer.from(...)` at the `HDNode` boundary.

This upgrade should include the HD wallet unit tests because byte/encoding mistakes can pass typechecking while changing cryptographic output.

### Zod 4

Observed impact:

- A nested object schema using `.default({})` no longer accepts the incomplete default object under Zod 4's default semantics.
- `.prefault({})` preserves the old behavior of parsing the empty object and applying defaults from its child fields.
- `ZodSchema` needs a type-only import with the repository's `verbatimModuleSyntax` settings.

Zod is used broadly across API schemas, tRPC DTOs, Redis/deprecated database data, authentication, and LNURL parsing. Its upgrade should have dedicated schema tests and should not be hidden inside another framework upgrade.

### ESLint 10 and eslint-plugin-cypress 7

Upgrade together:

- `eslint` 9 to 10
- `eslint-plugin-cypress` 5 to 7
- declare `@eslint/js` and `globals` directly because the repository imports them in its config

Observed impact:

- `eslint-plugin-cypress/flat` is no longer exported; import `eslint-plugin-cypress` instead.
- ESLint 10 enabled new recommended rules against existing code, notably `no-useless-assignment` and `preserve-caught-error`.
- ESLint 10's hierarchical config lookup changed how the shared config's relative file glob applied from `frontend/eslint.config.js`; the browser-global glob needed to work from both config locations.
- This migration needs an explicit decision: refactor all existing findings or disable the newly introduced rules to preserve the previous lint contract. That decision should not be buried in a dependency-only commit.

Reference: <https://eslint.org/docs/latest/use/migrate-to-10.0.0>

### Vitest 5

Observed impact:

- Stricter mock function types exposed a mock whose declared implementation accepted an argument while the original mock was typed with no arguments.
- An exported router mock's inferred type referred to a private Vitest chunk and therefore needed an explicit/public boundary or to stop being exported.
- Vitest 5 enables `clearMocks` by default, which can change test behavior even where compilation succeeds.

Vitest 5 requires Vite 6.4 or later and Node 22.12 or later. The current Vite and Node baselines satisfy that requirement, but Vitest should still be upgraded separately and the entire unit suite should be run.

Reference: <https://main.vitest.dev/guide/migration>

### Vite 8

No immediate type error was attributed to Vite 8, but it should still be isolated because:

- Vite 8 replaces Rollup and esbuild internals with Rolldown and Oxc.
- This project has custom `rollupOptions`, multiple build modes, a library build, Vue, HTML, and Tailwind plugins.
- The production frontend build was not run after the experiment.

Validate the normal frontend build, maintenance build, and library build rather than treating one successful typecheck as sufficient.

References:

- <https://vite.dev/guide/migration.html>
- <https://vite.dev/blog/announcing-vite8>

### Cypress 16 and webpack preprocessor 8

Upgrade together:

- `cypress` 15 to 16
- `@cypress/webpack-preprocessor` 7 to 8

Observed/configuration impact:

- The exact Cypress entry in `allowScripts` must be updated from `cypress@15.21.1` to `cypress@16.0.0` so npm permits its binary-install postinstall script.
- Cypress 16.0.0 was installed and `npx cypress version` confirmed matching package and binary versions.
- The webpack preprocessor's peer dependency graph changed and includes webpack/Babel peers.
- The Cypress configuration loaded successfully at the package level, but the E2E suite was not run.

Because Cypress and the preprocessor are coupled at runtime, keep them in one focused E2E-tooling upgrade rather than the dependency-only first batch.

### jsdom 30 and its types

Upgrade together:

- `jsdom` 26 to 30
- `@types/jsdom` 21 to 30
- Node patch version as required

Observed constraint:

- jsdom 30.0.1 requires Node `^22.22.2 || ^24.15.0 || >=26.0.0`.
- The repository's original `.nvmrc` (`v24.13.0`) is too old even though Node major 24 is correct.
- The experiment changed `.nvmrc` to `v24.20.0`.

This is not an application-code migration, but it is not suitable for a strictly dependency-only first run because it changes the runtime baseline. Upgrade and validate it alongside the Node patch.

## Intentionally excluded for now

### Tailwind CSS 4

Keep `tailwindcss` on the latest 3.4 release in this upgrade series.

Tailwind 4 is a separate styling-system migration:

- The PostCSS plugin moved to `@tailwindcss/postcss`; Vite projects are encouraged to use `@tailwindcss/vite`.
- The existing `@tailwind base/components/utilities` directives change to a CSS import.
- Configuration is CSS-first and the current project has a substantial TypeScript Tailwind config and custom plugin.
- Tailwind 4 raises its browser baseline to Safari 16.4, Chrome 111, and Firefox 128.
- Visual regression checking is required.

Reference: <https://tailwindcss.com/docs/upgrade-guide>

### TypeScript 7

Keep TypeScript pinned to `~5.9.3`.

TypeScript is foundational to Vue, vue-tsc, tRPC, Vite/Vitest configuration, `tsc-alias`, Cypress preprocessing, and all three project typechecks. It should move only after its ecosystem integrations explicitly support the new major and in its own migration.

### Node types 26

Keep `@types/node` on major 24 while production and development use Node 24. The existing `^24.13.3` range was already at the latest available Node 24 typings during the investigation.

## Recommended upgrade sequence

1. Start from the clean, pre-experiment checkout described in the handoff section.
2. Apply the first-run dependency group and update the lockfile.
3. Validate the first run once with lint, project-wide typecheck, unit tests, builds, and the relevant small smoke checks.
4. Upgrade each focused group independently in this order:
   1. Node patch + jsdom/types
   2. Vite 8
   3. Vitest 5
   4. Cypress 16 + webpack preprocessor 8
   5. ESLint 10 + eslint-plugin-cypress 7
   6. Zod 4
   7. JOSE 6
   8. bip32 5
   9. Express 5 + its types
5. Handle Tailwind 4 and TypeScript 7 as later dedicated projects.

Complete Zod, JOSE, and bip32 before Express so their behavior is validated before changing HTTP request handling. The Express override also applies to `lnurl`, which widens its compatibility checks. Keep coupled packages together and each behavior-changing major in its own reviewable batch. Stop after each completed batch for review and commit before starting the next.

## Validation status of the combined experiment

Completed after applying experimental compatibility changes:

- `npm install`
- `npm ls --depth=0`
- `npm install-scripts ls`
- `npx cypress version`
- `npm run lint`
- `npm run typecheck`

The final lint and project-wide typecheck both passed after the experimental source changes.

Not run because the combined migration was intentionally stopped:

- Unit tests
- Backend integration tests
- Cypress E2E tests
- Playwright E2E tests
- Frontend production builds, including maintenance and library variants
- Backend production build
- Schema-generation smoke test for `@dbml/core`
- Runtime smoke tests for Express 5 routes
- Visual checks

`npm install` reported five low-severity audit findings. No forced audit fix was attempted because that could introduce unrelated breaking dependency changes.

## Expected starting state after the experiment is reverted

A future implementation session should expect only this documentation to survive from the investigation. None of the following experimental changes should be assumed to exist:

- Node `.nvmrc` bump from 24.13.0 to 24.20.0.
- Package and lockfile upgrades.
- Added `@vue/devtools-api`, `@eslint/js`, or `globals` declarations.
- Express route-parameter helper and route call-site changes.
- JOSE `CryptoKey` migrations.
- bip32 `Buffer.from(...)` conversions.
- Zod `.prefault({})` or type-only import changes.
- ESLint configuration changes.
- Vitest-compatible mock changes.
- Cypress `allowScripts` change.

Use the findings as a map for future focused upgrades, then re-derive the smallest correct change against the current source tree.

## Upgrade log

### 2026-09-05: First batch completed

Applied the first batch from a clean working tree after rechecking npm releases and peer/engine requirements. This entry records the actual upgrade; the clean-baseline assumptions and incomplete validation above describe the earlier combined experiment.

| Package | Before | After |
| --- | --- | --- |
| `@vueuse/core` | `^13.9.0` | `^14.4.0` |
| `@dbml/core` | `^3.14.1` | `^10.1.1` |
| `clipboardy` | `^4.0.0` | `^5.3.2` |
| `start-server-and-test` | `^2.1.5` | `^3.0.12` |
| `vue-router` | `4.6.4` | `5.3.1` |
| `pinia` | `^3.0.4` | `^4.0.3` |
| `@pinia/testing` | `^1.0.3` | `^2.0.1` |
| `@vue/devtools-api` | not declared | `^8.2.1` in dependencies |

`@vue/devtools-api` 8.2.1 superseded the guide's 8.1.5 target. Regenerated `package-lock.json` with npm and confirmed that only the intended direct dependencies changed. No application or configuration changes were needed; all later migration groups remain deferred.

Validation passed on Node `v24.20.0` with npm `11.19.0`:

- `npm install` and `npm ls --depth=0`.
- `npm run lint` and `npm run typecheck`.
- `npm run test-units`: 417 tests passed and 1 skipped across 117 files.
- `npm run frontend-build` and `npm run backend-build`.
- Schema-generation smoke check using the existing generator in a temporary directory, covering tables, an enum, a boolean default, an index, and a reference. The repository's `docs/database.dbml` is missing, so the check used a fixture with supported types rather than the real schema.
- Actual Cypress clipboard tasks completed a write/read round trip outside the sandbox, then restored the original clipboard text.
- `start-server-and-test` started a temporary localhost server, waited for readiness, ran a response check, and shut the server down. This required execution outside the sandbox.
- `git diff --check`.

Reviewed all four npm overrides and retained them: LNURL still pins older Express, Express dependencies restrict `qs` to 6.15.x, LNURL-related packages request older `secp256k1`, and Drizzle tooling requests older `esbuild` versions. Refreshed `npm audit`: five low-severity findings remain, all stemming from the `elliptic` advisory `1112030`. No patched release is listed. The existing `.nsprc` exception still applies, and `npm run audit` passes with it. Neither the overrides nor `.nsprc` changed.

Release verification still outstanding:

- Staging/manual checks and full Cypress, Playwright, and backend integration suites, particularly navigation, login, and card/set workflows.
- Maintenance and library frontend builds and visual checks.
- Validation on the pinned Node `v24.13.0`; `.nvmrc` remains unchanged.

The normal frontend build passed with warnings about `qrcode-svg` importing `fs` and the English locale being imported both statically and dynamically. The batch is ready for review and commit as a release candidate, subject to the remaining runtime checks. Work stopped here to allow a commit and potential release before the next migration. No commit or release was performed during this session.

### 2026-09-07: Node LTS + jsdom batch completed

- Updated `.nvmrc` from `v24.13.0` to `v24.20.0` within Node 24 LTS, satisfying jsdom 30's Node 24 minimum of 24.15.0.
- Updated `jsdom` from `^26.1.0` to `^30.0.1` and `@types/jsdom` from `^21.1.7` to `^30.0.0`, after checking current releases and requirements. Regenerated the lockfile; no other direct dependency versions changed.
- Keep CI, Compose, and Docker helper scripts on the floating `node:lts-bookworm-slim` tag, per user preference. The temporary exact-version image pins were reverted. Preserve this LTS tag convention in future upgrade batches.
- No application or test source changes were required. Node typings remain on major 24; overrides and `.nsprc` are unchanged.

Validation passed locally on Node `v24.20.0` with npm `11.19.0`: install, lint, project-wide typecheck, unit suites (417 passed, 1 skipped across 117 files), normal frontend production build, backend production build, and dependency-tree checks. Vitest resolves jsdom 30.0.1. `npm run audit` passes with the existing elliptic exception; npm still reports five low-severity findings.

Full CI/Docker execution, staging/manual checks, backend integration tests, Cypress/Playwright E2E suites, maintenance/library builds, and production-server Node verification remain outstanding. The production Node installation is managed outside this repository. The normal frontend build retains the previously recorded browser externalization and locale chunking warnings.

Stopped after this batch for review, commit, and potential release. No commit or release was performed. Vite remains the next separate migration.

### 2026-09-07: Vite 8 batch completed

- Updated `vite` from `^7.3.6` to `^8.2.2` and regenerated the lockfile after checking current npm releases, engines, and plugin peers. No other direct dependency changed.
- Existing `@vitejs/plugin-vue` 6.0.8 and `vite-plugin-html` 3.2.2 accept Vite 8. Node `v24.20.0` satisfies its engine requirement.
- Vitest 3.2.7 retains nested Vite 7.3.6 dependencies because its supported range excludes Vite 8. The unit suites therefore validate compatibility with the existing test runner, while production builds and the development smoke check exercise Vite 8.
- No application or configuration edits were required. Keep `rollupOptions` (a supported but deprecated alias in Vite 8) while the frontend configuration is also merged into Vitest's Vite 7 configuration. `commonjsOptions` is a no-op in Vite 8; reassess these settings with the next Vitest migration.
- Vite 8 changes bundling and minification to Rolldown/Oxc and Lightning CSS, and raises the default browser targets to Chrome/Edge 111, Firefox 114, and Safari 16.4. See the [official migration guide](https://vite.dev/guide/migration.html).

Validation passed on Node `v24.20.0` with npm `11.19.0`:

- Installation, `npm ls --depth=0`, lint, and project-wide typecheck.
- Unit suites: 417 passed and 1 skipped across 117 files.
- Normal frontend build, maintenance build (`BUILD_MAINTENANCE=true`), library build (`VITE_BUILD_LIBS=true`, both ES and UMD output), and backend build.
- Actual Vite CLI localhost smoke check: served HTML and transformed `/src/main.ts`, then shut down successfully. An initial inline JavaScript API harness served/transformed successfully but stalled during shutdown and was stopped by a 20-second timeout; the CLI check replaced that harness.
- Lockfile review confirmed Vite was the only existing package entry whose version changed; new bundler/platform dependencies and nested Vite 7 copies account for the remaining changes. `git diff --check` passed.

The existing `qrcode-svg` browser externalization warning remains. npm install still reports five low-severity audit findings; overrides and `.nsprc` are unchanged. Full browser/visual checks, staging workflows, E2E suites, and backend integration tests were not run.

Stopped after this batch for review and commit. No commit or release was performed. Vitest 5 is the next separate migration.

### 2026-09-07: Vitest 5 batch completed

- Updated `vitest` from `^3.2.7` to `^5.0.0` after checking npm releases, engines, peers, and the [Vitest 4](https://v4.vitest.dev/guide/migration) and [Vitest 5](https://vitest.dev/guide/migration/) migration guides. No other direct dependency version changed.
- Vitest now shares Vite 8.2.2 with the app; the nested Vite 7 copies and `vite-node` were removed from the lockfile. Node 24.20.0, jsdom 30.0.1, and the existing Vitest ESLint plugin satisfy the requirements.
- Updated database and JOSE constructor mocks to use constructible functions. Corrected the mocked transaction callback type to accept a query instance, declared the card-summary mock's string argument, and removed an unused router-mock export whose inferred type exposed private Vitest declarations.
- Awaited the login-rejection assertion, which Vitest now rejects when unawaited. Kept the new `clearMocks: true` default and adjusted two profile assertions to count calls within the current test instead of accumulating calls across tests. No production application code changed.
- Completed the deferred Vite configuration cleanup: renamed `rollupOptions` to `rolldownOptions` and removed the obsolete `commonjsOptions`, now that both builds and tests use Vite 8.

Final validation passed on Node `v24.20.0` with npm `11.19.0`:

- Installation, dependency-tree checks, lint, and project-wide typecheck.
- All unit suites: 417 passed and 1 skipped across 117 files, now running Vitest 5 with Vite 8.
- Normal, maintenance, and library frontend builds (both ES and UMD library output), plus the backend build.
- Reviewed the package/lockfile diff and ran `git diff --check`.

The normal frontend build retains the existing `qrcode-svg` browser externalization warning. npm install reports five low-severity findings; overrides and `.nsprc` remain unchanged. Backend integration tests, Cypress/Playwright E2E suites, browser/visual checks, and CI/Docker execution were not run.

Stopped after this batch for review and commit. No commit or release was performed. Cypress 16 + webpack preprocessor 8 is the next separate migration.

### 2026-09-07: Cypress 16 + webpack preprocessor 8 batch completed

- Updated `cypress` from `^15.21.1` to `^16.0.0` and `@cypress/webpack-preprocessor` from `^7.1.2` to `^8.0.0`, including the exact Cypress `allowScripts` entry. Current npm engines and webpack/Babel peers are satisfied.
- Removed `allowCypressEnv`, which Cypress 16 no longer supports, following the [official migration guide](https://docs.cypress.io/app/references/migration-guide#Migrating-to-Cypress-160). Existing environment access already uses `Cypress.expose()` and `cy.env()`. No other removed API usage was found, and no application or existing test changes were needed.
- Preserved the preceding minor updates: DOMPurify 3.4.15, Playwright 1.63.0, and eslint-plugin-vue 10.11.0. Kept eslint-plugin-cypress pinned to 5.3.0 because npm still marks 5.4.0 deprecated for accidental breaking changes. Overrides and `.nsprc` remain unchanged.

Validation on Node `v24.20.0` with npm `11.19.0`:

- Installation, dependency-tree checks, lint, and project-wide typecheck passed.
- Unit suites: 417 passed and 1 skipped across 117 files.
- Cypress package and binary both report 16.0.0. Binary verification passed after removing the execution environment's inherited `ELECTRON_RUN_AS_NODE` flag with `env -u ELECTRON_RUN_AS_NODE`.
- A temporary headless Chrome 152 smoke spec passed through the real Cypress configuration, plugin registration, support file, and webpack preprocessor. It exercised a TypeScript import, public configuration access, DOM interaction, typing, and an assertion without application services. No removed-option or deprecation warnings appeared. The temporary spec was removed afterward.
- The separate Cypress TypeScript check encountered Drizzle dependency declaration errors. `npx tsc --noEmit --skipLibCheck -p e2e-cypress/tsconfig.json` passed; the config was not changed to suppress these errors.
- Reviewed the package/lockfile diff and ran `git diff --check`. npm still reports five low-severity audit findings.

Full application Cypress/Playwright E2E suites and backend integration tests were not run; the localhost backend readiness check failed. Application builds, CI/Docker execution, and visual checks were not repeated for this E2E-tooling batch. Cypress 16's network, visibility, typing-delay, and cookie/storage query behavior still require coverage in the full application E2E run.

Stopped after this batch for review and commit. No commit or release was performed. ESLint 10 + eslint-plugin-cypress 7 is the next separate migration.

### 2026-09-07: ESLint 10 + eslint-plugin-cypress 7 batch completed

- Updated `eslint` from `^9.39.5` to `^10.10.0` and `eslint-plugin-cypress` from `5.3.0` to `7.0.1`, preserving the plugin's exact-version declaration. Added direct development dependencies on `@eslint/js` `^10.0.1` and `globals` `^17.12.0`, which the configuration already imports. Regenerated the lockfile and verified current npm releases and requirements; the existing Vue, TypeScript, and Vitest lint integrations accept ESLint 10.
- Replaced the removed `eslint-plugin-cypress/flat` import with `eslint-plugin-cypress`. Removed the redundant `frontend/eslint.config.js` re-export so ESLint discovers the root config directly, retaining the precise `frontend/public/**/*.{js,cjs,mjs}` browser-global glob. Existing Cypress rule file patterns remain unchanged.
- Kept the new recommended rules enabled. Removed 15 redundant initial assignments, using explicit types or a local `const` as appropriate. Preserved caught errors with `cause` in both card-lock timeout errors and the LNBits integration-test helper; error messages remain unchanged.
- Reviewed the dependency diff: version changes are confined to ESLint, its plugin, globals, and supporting transitive dependencies. Overrides, runtime dependency declarations, and `.nsprc` remain unchanged.

Validation passed on Node `v24.20.0` with npm `11.19.0`:

- Installation and `npm ls --depth=0`.
- Final lint and project-wide typecheck.
- Unit suites: 417 passed and 1 skipped across 117 files.
- Configuration-resolution smoke check for Cypress recommended rules at the existing configured path and browser globals under `frontend/public`.
- `git diff --check`.

Builds, backend integration tests, application E2E suites, and CI/Docker execution were not run for this lint-tooling batch. The frontend unit run reports a Vite future-native-config-loader warning about the extensionless `./vite.config` import; this configuration was not changed. npm install still reports five low-severity audit findings.

Stopped after this batch for review and commit. No commit or release was performed. Zod 4 is the next separate migration, followed by JOSE 6, bip32 5, and Express 5 + its types.

### 2026-09-07: Zod 4 batch completed

- Confirmed npm reports Zod `4.5.4` as the current release and reviewed the [Zod 4 migration guide](https://zod.dev/v4/changelog). The installed tRPC server uses Zod 4 in its own development dependencies.
- Updated `zod` from `^3.25.76` to `^4.5.4`. The user completed installation after the initial silent install was stopped. Verified the installed version and reviewed the package/lockfile diff: only Zod changed; overrides and other direct dependencies are unchanged.
- Changed the nested deprecated-user profile from `.default({})` to `.prefault({})` to preserve child defaults, and changed the axios helper's `ZodSchema` import to a type-only import.
- Added regression coverage for missing profiles, partial profiles, and invalid stored profile fields.

Validation passed:

- Installed-version and dependency-tree check (`npm ls zod --depth=1`).
- Lint and project-wide typecheck.
- Unit suites: 420 passed and 1 skipped across 118 files, including the three new profile-schema regression tests.
- Normal frontend production build and backend production build.
- `git diff --check`.

The existing Vite warning about the extensionless test-config import and the `qrcode-svg` browser externalization warning remain. Backend integration tests, application E2E suites, maintenance/library builds, CI/Docker execution, and staging/visual checks were not run for this batch.

Stopped after this batch for review and commit. No commit or release was performed. JOSE 6 is next, followed by bip32 5 and Express 5 + its types.

### 2026-09-08: JOSE 6 batch completed

- Confirmed JOSE `6.2.12` as the current npm release and reviewed the [JOSE 6 release notes](https://github.com/panva/jose/releases/tag/v6.0.0). Updated `jose` from `^5.10.0` to `^6.2.12`; no other dependency changed.
- Replaced the removed `KeyLike` type with JOSE's exported `CryptoKey` type throughout the JWT boundary. Updated the backend runtime assertion because imported keys are now Web Crypto `CryptoKey` instances instead of Node.js `KeyObject` instances.
- Made generated and imported private keys explicitly extractable. JOSE 6 returns Web Crypto keys, and the application must export private keys to PKCS#8 when persisting them.
- Added an unmocked round-trip regression test covering RSA key generation, PEM save/load, signing with both generated and reloaded private keys, verification with converted and reloaded public keys, and rejection for invalid audience, issuer, expiry, and signature.

Validation passed on Node `v24.20.0` with npm `11.19.0`:

- Installation and dependency-tree check (`npm ls jose --depth=1`).
- Lint and project-wide typecheck.
- Unit suites: 421 passed and 1 skipped across 119 files.
- Normal frontend production build and backend production build.
- `git diff --check`.

The existing Vite warning about the extensionless test-config import and the `qrcode-svg` browser externalization warning remain. Backend integration tests, application E2E suites, maintenance/library builds, CI/Docker execution, and staging checks were not run for this batch.

Stopped after this batch for review and commit. No commit or release was performed. bip32 5 is next, followed by Express 5 + its types.

### 2026-09-08: bip32 5 batch completed

- Updated `bip32` from `^4.0.0` to `^5.0.1` in commit `b34abf50` (`chore: upgrade bip32 to v5`).
- Adapted the bip32 boundary to its `Uint8Array` API for seeds, hashes, signatures, and key material while preserving the existing `HDNode` public API: byte-returning key methods still return Node.js `Buffer` values, and signatures still return the requested hex or base64 string encoding.
- Added deterministic regression coverage for the derived private/public keys, key byte types, hex encodings, signature lengths, successful verification, and rejection of a signature for a different message.

The committed diff records the dependency, compatibility changes, and focused regression tests, but does not record which validation commands were run. Treat wider lint, typecheck, build, and test-suite validation for this batch as undocumented rather than confirmed here.

### 2026-09-08: subsequent minor upgrade completed

- Updated the exact `eslint-plugin-cypress` development dependency from `7.0.1` to `7.0.2` in commit `6293c156` (`chore: minor upgrade`). Its lockfile dependency on `globals` moved from `^17.11.0` to `^17.12.0`; the repository's direct `globals` version was already `^17.12.0`.
- No application or configuration files changed. The commit does not record its validation commands, so validation for this follow-up is undocumented here.

### 2026-09-09: Express 5 + types batch completed

- Confirmed and installed the current npm releases: `express` `5.2.1` and `@types/express` `5.0.6`.
- Kept `lnurl` on a nested, overridden `express` `4.22.2`. `lnurl` `0.27.0` declares Express `4.19.2` and still relies on Express 4 wildcard-route syntax and writable `req.query`; forcing it onto Express 5 prevents its server from starting.
- Added route-specific parameter types so required named parameters remain strings throughout their handlers and reusable middleware.
- Removed a handlerless `router.get('/')` registration. Express 4 tolerated this no-op, while Express 5 rejects it during application startup.
- Reviewed the Express 5 runtime migration boundaries. The Tipcards backend has no incompatible wildcard or optional route patterns, does not mutate `req.query`, does not use Express static-file serving, and already uses explicit `body-parser` middleware.

Validation passed on Node `v24.20.0` with npm `11.19.0`:

- Installation and dependency-tree check (`npm ls express lnurl --all`): Tipcards resolves Express `5.2.1`, while `lnurl` resolves its nested Express `4.22.2` override.
- Lint and project-wide typecheck.
- Unit suites: 423 passed and 1 skipped across 120 files.
- Backend production build.
- Runtime application-startup and `/api/dummy` route smoke test against the compiled backend.
- Real `lnurl` server startup and `/status` route smoke test against its nested Express 4 runtime.
- Automated regression coverage confirms that an `EADDRINUSE` error from Express 5's `app.listen()` callback rejects startup instead of being logged as a successful listen.
- Dependency audit with the existing low-severity `elliptic` exception only.
- `git diff --check`.

Backend integration tests, application E2E suites, frontend production builds, CI/Docker execution, and staging checks were not run for this batch.

Stopped after this batch for review and commit. No commit or release was performed. Tailwind 4 and TypeScript 7 remain separate later projects.
