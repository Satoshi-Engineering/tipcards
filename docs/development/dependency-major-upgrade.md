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
4. Upgrade each focused group independently in roughly this order:
   1. Node patch + jsdom/types
   2. Vite 8
   3. Vitest 5
   4. Cypress 16 + webpack preprocessor 8
   5. ESLint 10 + eslint-plugin-cypress 7
   6. Express 5 + its types
   7. JOSE 6
   8. bip32 5
   9. Zod 4
5. Handle Tailwind 4 and TypeScript 7 as later dedicated projects.

The exact order among independent backend libraries is flexible. The important constraints are keeping coupled packages together and keeping each behavior-changing major isolated enough to review and roll back.

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
