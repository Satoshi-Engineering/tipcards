# Cypress to Playwright migration

## Purpose

This guide tracks the incremental migration of every Cypress test to Playwright. Codex performs one small, reviewable batch at a time. Do not migrate the complete suite in one change.

The migration changes the test runner, not the tested behavior. Every active Playwright replacement must test the same scenario, setup, interaction, observable result, and failure condition as its Cypress source.

## Non-negotiable rules

1. Preserve the exact behavior covered by each Cypress test. Do not remove assertions, combine distinct cases, weaken values to generic visibility checks, or replace an end-to-end interaction with a lower-level shortcut.
2. Preserve the relevant execution constraints, including viewport, browser-visible navigation, cookies, local storage, request ordering, delayed responses, database state, LNURL/LNbits behavior, and expected error responses.
3. Keep existing test names unless Playwright requires an additional parent description for uniqueness.
4. Do not change application behavior, production code, test data, timeouts, or selectors merely to make a migration pass. Diagnose mismatches first.
5. Use Playwright locators and web-first assertions. A direct value assertion does not replace Cypress retry behavior; use locator assertions, `expect.poll`, or an explicit awaited event where the Cypress assertion retried.
6. Keep each test isolated to the same degree as before. Do not enable Playwright parallelism while migrated tests share the database, wallets, or ordered state.
7. Preserve the current Cypress Chrome baseline. Migrated browser tests use a `1000x660` viewport unless the source test establishes another viewport. Do not change the existing Playwright tests' viewport globally.
8. Preserve existing skipped behavior. A Cypress test that was already skipped must not become active as a side effect of migration.
9. Add helpers only when a batch needs them. Prefer an explicit local helper over a speculative Cypress compatibility layer.
10. Run focused verification during a batch and the full CI suites once when the batch is complete. Do not repeatedly run all browser tests between small edits.

## Baseline

Inventory date: 2026-09-09.

- Cypress: 42 spec files and 154 statically declared `it` calls.
- `TheLangNav.test.ts` generates eight locale cases from one declared `it`, giving 161 runtime cases with the current locale list.
- Three Cypress cases are already skipped: one slider swipe case and two history loading-indicator cases.
- Playwright: eight existing feature files. These remain authoritative and must not be rewritten as part of Cypress migration batches.
- Cypress runs Chrome in CI. Playwright currently runs Chromium with one worker and `fullyParallel: false`.

Recount the inventory before each batch. The repository may have gained or removed tests since this snapshot.

## Migration states

Each row in the inventory uses one of these states:

- `planned`: no Playwright replacement exists.
- `dual-run`: the Playwright replacement exists, but the Cypress source remains active while equivalence is verified.
- `migrated`: the Playwright replacement passed focused verification and the corresponding Cypress test is marked and skipped.
- `blocked`: exact equivalence cannot currently be demonstrated; record the reason and do not weaken the test.

Do not mark a case `migrated` based only on typechecking or source review.

## How to mark migrated Cypress tests

Keep the Cypress body as an executable specification until the entire migration is finished. Mark and skip each migrated test individually:

```ts
// MIGRATED TO PLAYWRIGHT: e2e-playwright/features/auth/api.publicKey.test.ts
it.skip('should return public key', () => {
  // Keep the original Cypress body unchanged.
})
```

Do not use only `describe.skip`; individual cases must remain visibly accounted for. Do not delete migrated Cypress files or helpers during intermediate batches. Cleanup happens only after every case is migrated and the Playwright suite has passed reliably.

For a test that was already skipped before the migration, retain its original skip and add a separate migration note only after a skipped Playwright equivalent exists. Record that it was pre-existing; do not count it as newly disabled coverage.

## Batch workflow

For every batch:

1. Read every selected Cypress test and every helper it calls. Write down the setup, action, assertions, and timing or state constraints before translating it.
2. Create the Playwright files under the corresponding `e2e-playwright` area. Preserve one test case per Cypress test case.
3. Reuse existing Playwright helpers where their behavior matches exactly. Port only the smallest missing helper surface needed by this batch.
4. Run the original Cypress cases and record the result before skipping them.
5. Run the Playwright replacements against a fresh equivalent environment. Compare the actual assertions and relevant request/state transitions, not only the final pass result.
6. If equivalence is demonstrated, add the migration comment and change each corresponding Cypress `it` to `it.skip`. Set the inventory state to `migrated` and record the replacement path.
7. Run the focused Playwright replacements again and run the affected Cypress spec once to prove the intended cases are reported as skipped.
8. Run lint and typecheck once after the batch. Let the normal GitLab pipeline run the complete Cypress and Playwright jobs once.
9. Stop for review. Do not begin the next batch in the same change.

If either runner exposes a product defect or a semantic difference, stop the migration for that case and mark it `blocked`. Fixing product behavior is a separate change.

## Equivalence checklist

For every migrated test, compare all applicable items:

- Same initial URL, locale, viewport, authentication state, cookies, and local storage.
- Same generated identifiers, amounts, dates, record counts, and seeded relationships.
- Same user-visible actions in the same order.
- Same exact text, attribute, URL, count, ordering, visibility, and absence assertions.
- Same API method, endpoint, body, headers, response status, and error expectation.
- Same intercepted or delayed request and the same release point.
- Same database mutation when the Cypress test uses `cy.task`.
- Same LNURL encoding, authentication callback, invoice payment, withdrawal, wallet role, and balance constraint.
- Same clipboard call and copied value when clipboard behavior is tested.
- Same reload, redirect, new-window, history, and cross-origin behavior.
- Same subscription readiness signal when the source uses `waitForSubscription`.
- Same explicit timeout and no silently reduced retry allowance. Cypress currently permits DOM commands and requests to wait for up to 60 seconds; use a narrowly scoped Playwright timeout where an equivalent operation can legitimately take that long. Do not add 60-second waits to assertions that are immediate by contract.

## Cypress-to-Playwright boundaries

### Selectors and retry behavior

- Translate `[data-test=...]` selectors without changing their scope or `.first()` semantics.
- Prefer Playwright locator assertions such as `toBeVisible`, `toHaveText`, `toHaveCount`, and `toHaveAttribute` because they retry.
- Use `expect.poll` for state obtained through API or database reads.
- Do not translate `cy.get(...).should(...)` to an immediate `isVisible()` or `textContent()` assertion.

### Requests and interception

- Translate `cy.request` to the Playwright request fixture or a deliberately scoped `APIRequestContext`.
- Preserve `failOnStatusCode: false` by asserting the expected non-success status explicitly.
- Translate passive `cy.intercept(...).as(...)` waits to `page.waitForResponse` paired with the triggering action.
- Translate stubbed responses to `page.route` or `browserContext.route`, preserving status, headers, body, and delay.
- Do not use `networkidle` as a generic replacement for a named request or UI readiness condition.

### Browser state

- Use `browserContext.addCookies` and `browserContext.cookies` for cookie setup and assertions.
- Establish local storage before navigation with an init script when the Cypress test requires state during application startup.
- Preserve reload-versus-new-navigation distinctions.
- Stub clipboard behavior in the page and assert the call argument; do not depend on the host clipboard.

### Node-side tasks

Cypress plugins currently provide database, JWT, LNURL, and clipboard tasks. Playwright tests run in Node and can call equivalent typed helpers directly.

- Move database operations behind focused helpers in `e2e-playwright/utils/database` as they are needed.
- Reuse the existing shared JWT and LNURL domain modules rather than copying Cypress task wrappers.
- Preserve transaction boundaries, inserted values, returned identifiers, and direct database timing.
- Keep secrets in the current environment contract and never print them.
- Remove a Cypress plugin only after no active or skipped Cypress source still references it.

### Viewport-sensitive tests

The current Cypress default is `1000x660`; the existing Playwright Desktop Chrome project uses a different viewport. Set the Cypress-compatible viewport only for migrated tests, preferably through a small migration fixture or file-level `test.use` call.

Viewport, slider, intersection, lazy-loading, and responsive-navigation assertions must be evaluated using the same geometry. Preserve the slider's horizontal intersection thresholds rather than substituting Playwright's generic visibility definition.

## Planned batches

### Batch 0: baseline audit

Before the first implementation batch:

- Record the current focused Cypress results for the Batch 1 cases.
- Confirm required environment variables and request behavior from the active configuration.
- Decide the replacement paths recorded below.

This is an inspection step and does not create a generic compatibility layer. Add an origin accessor, request helper, or Cypress-compatible viewport setup only in the first batch that actually needs it. Do not port the Cypress page-object and plugin trees wholesale.

### Batch 1: simplest API smoke tests

Migrate together:

- `e2e-cypress/tests/features/auth/api.publicKey.test.ts` — one unauthenticated HTTP response-shape case.
- `e2e-cypress/tests/trpc/profile.test.ts` — one unauthenticated tRPC rejection case.

These cases require no browser interaction, database task, wallet operation, or shared test sequence. This is the first implementation batch.

Completed on 2026-09-22. Both Cypress source cases passed before migration, both Playwright replacements passed against the same local environment, and the focused post-migration verification passed.

### Batch 2: public navigation

Consider two or three files together after Batch 1:

- `e2e-cypress/tests/index.test.ts`
- `e2e-cypress/tests/features/homePageLinks.test.ts`
- `e2e-cypress/tests/features/aboutPageLinks.test.ts`

Preserve same-tab versus external navigation behavior and exact URLs. Do not replace navigation assertions with href-only assertions unless the Cypress source asserted only the href.

### Batch 3: application shell and locales

- `e2e-cypress/tests/components/layout/TheHeader.test.ts`
- `e2e-cypress/tests/components/layout/TheLangNav.test.ts`

Preserve header scope, first-element selection, menu open/close behavior, all eight generated locales, translated button text, document language, and optional trailing-slash behavior.

### Batch 4: simple client and logged-out state

- `features/localStorageSets.test.ts`
- `features/auth/refreshToken.test.ts`
- `features/historyList/historyList.empty.test.ts`
- `features/setsList/setsList.empty.test.ts`

This batch establishes browser storage and the smallest reusable login/UI helpers.

### Batch 5: authentication and session lifecycle

- `features/auth/accessToken.test.ts`
- `features/auth/loginOverlay.loginWarning.test.ts`
- `features/auth/loginOverlay.test.ts`
- `features/auth/logout.test.ts`
- `features/auth/logout.allOtherDevices.test.ts`
- `features/auth/refreshToken.expired.test.ts`
- `features/auth/refreshToken.revoked.test.ts`
- `trpc/auth.test.ts`

Port JWT, LNURL-auth, cookie, clipboard, and backend-error behavior incrementally within this batch group. Split it further if one review would contain more than one new helper boundary.

### Batch 6: profile and basic collection views

- `features/profileData.test.ts`
- `features/setsList/setsList.withSets.test.ts`
- `pages/sets.test.ts`
- `pages/dashboard.cardsSummary.test.ts`
- `pages/dashboard.setsList.test.ts`

### Batch 7: cards, landing pages, and funding state

- `deprecated/api/multipleInvoices.test.ts`
- `features/feeCalculation.test.ts`
- `pages/card.test.ts`
- `pages/landing.bulkWithdraw.test.ts`
- `pages/landing.content.test.ts`
- `pages/landing.funded.test.ts`
- `pages/landing.unfunded.test.ts`
- `pages/landing.withdraw.test.ts`

Reuse the existing Playwright LNbits helpers only where their amounts, wallet roles, polling, and status assertions match the Cypress source exactly.

### Batch 8: database-heavy lists, delayed responses, and ordering

- `features/historyList/historyList.loginStateChanges.test.ts`
- `features/historyList/historyList.updateData.test.ts`
- `features/historyList/historyList.withData.test.ts`
- `features/setsList/setsList.changeCardStatus.test.ts`
- `features/setsList/setsList.changeSettings.test.ts`
- `pages/dashboard.openTasks.test.ts`
- `pages/history.cardStatusList.test.ts`
- `pages/sets.cardsInfo.test.ts`
- `pages/sets.search.test.ts`

Preserve exact counts, ordering, delayed-response races, viewport intersection, database fixtures, and currently skipped cases.

### Batch 9: slider and pre-existing skipped cases

- `components/slider/SliderDefault.test.ts`
- The two pre-existing skipped cases in `pages/history.cardStatusList.test.ts`

Keep the swipe and loading-indicator cases skipped in Playwright unless they are independently repaired and re-enabled in a separate change. Preserve the slider geometry assertions and pagination scope.

## Inventory

All entries start as `planned`. Update the status and replacement path as work proceeds.

| Batch | Cypress spec | Declared cases | State | Playwright replacement |
| --- | --- | ---: | --- | --- |
| 1 | `features/auth/api.publicKey.test.ts` | 1 | migrated | `features/auth/api.publicKey.test.ts` |
| 1 | `trpc/profile.test.ts` | 1 | migrated | `trpc/profile.test.ts` |
| 2 | `index.test.ts` | 6 | planned | — |
| 2 | `features/homePageLinks.test.ts` | 5 | planned | — |
| 2 | `features/aboutPageLinks.test.ts` | 3 | planned | — |
| 3 | `components/layout/TheHeader.test.ts` | 6 | planned | — |
| 3 | `components/layout/TheLangNav.test.ts` | 1 generated across 8 locales | planned | — |
| 4 | `features/localStorageSets.test.ts` | 4 | planned | — |
| 4 | `features/auth/refreshToken.test.ts` | 2 | planned | — |
| 4 | `features/historyList/historyList.empty.test.ts` | 6 | planned | — |
| 4 | `features/setsList/setsList.empty.test.ts` | 6 | planned | — |
| 5 | `features/auth/accessToken.test.ts` | 2 | planned | — |
| 5 | `features/auth/loginOverlay.loginWarning.test.ts` | 2 | planned | — |
| 5 | `features/auth/loginOverlay.test.ts` | 5 | planned | — |
| 5 | `features/auth/logout.test.ts` | 2 | planned | — |
| 5 | `features/auth/logout.allOtherDevices.test.ts` | 3 | planned | — |
| 5 | `features/auth/refreshToken.expired.test.ts` | 1 | planned | — |
| 5 | `features/auth/refreshToken.revoked.test.ts` | 6 | planned | — |
| 5 | `trpc/auth.test.ts` | 2 | planned | — |
| 6 | `features/profileData.test.ts` | 1 | planned | — |
| 6 | `features/setsList/setsList.withSets.test.ts` | 3 | planned | — |
| 6 | `pages/sets.test.ts` | 4 | planned | — |
| 6 | `pages/dashboard.cardsSummary.test.ts` | 4 | planned | — |
| 6 | `pages/dashboard.setsList.test.ts` | 2 | planned | — |
| 7 | `deprecated/api/multipleInvoices.test.ts` | 2 | planned | — |
| 7 | `features/feeCalculation.test.ts` | 1 | planned | — |
| 7 | `pages/card.test.ts` | 5 | planned | — |
| 7 | `pages/landing.bulkWithdraw.test.ts` | 2 | planned | — |
| 7 | `pages/landing.content.test.ts` | 8 | planned | — |
| 7 | `pages/landing.funded.test.ts` | 2 | planned | — |
| 7 | `pages/landing.unfunded.test.ts` | 5 | planned | — |
| 7 | `pages/landing.withdraw.test.ts` | 3 | planned | — |
| 8 | `features/historyList/historyList.loginStateChanges.test.ts` | 5 | planned | — |
| 8 | `features/historyList/historyList.updateData.test.ts` | 2 | planned | — |
| 8 | `features/historyList/historyList.withData.test.ts` | 4 | planned | — |
| 8 | `features/setsList/setsList.changeCardStatus.test.ts` | 2 | planned | — |
| 8 | `features/setsList/setsList.changeSettings.test.ts` | 2 | planned | — |
| 8 | `pages/dashboard.openTasks.test.ts` | 10 | planned | — |
| 8/9 | `pages/history.cardStatusList.test.ts` | 6, including 2 pre-existing skips | planned | — |
| 8 | `pages/sets.cardsInfo.test.ts` | 4 | planned | — |
| 8 | `pages/sets.search.test.ts` | 10 | planned | — |
| 9 | `components/slider/SliderDefault.test.ts` | 3, including 1 pre-existing skip | planned | — |

## Final cleanup gate

Remove Cypress only after all inventory rows are migrated, all pre-existing skips are represented accurately, and several normal pipelines have passed with Playwright as the sole source of active E2E coverage.

The final cleanup may then remove Cypress CI jobs, live-check implementation, packages, configuration, plugins, helpers, and skipped source files. Perform that cleanup as its own reviewable change; do not mix it with the last behavioral migration batch.

## References

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright assertions](https://playwright.dev/docs/test-assertions)
- [Playwright network handling](https://playwright.dev/docs/network)
- [Cypress configuration defaults](https://docs.cypress.io/app/references/configuration)
