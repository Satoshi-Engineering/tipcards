# Changelog


## v0.4.19

[compare changes](https://gitlab.satoshiengineering.com/satoshiengineering/lightning-tip-cards/compare/v0.4.18...v0.4.19)

### 🚀 Enhancements

- Add french to available locales (d1f45f5a)

### 🩹 Fixes

- Ignore abort errors in console hooks (8d865cf9)

### 🏡 Chore

- Audit fix (b2d3a1f2)
- Bump esbuild expiry date as there is still no easy fix (06d0d5bb)
- Npm audit fix (8b73ea18)
- Npm audit fix (d26869ab)
- Npm audit fix (ce890c52)
- Npm audit fix (0f372918)
- Add gitignore to postgres example so we can boot the database directly from the example (7cc9e91a)

### ❤️ Contributors

- Thomas Schagerl <tom@satoshiengineering.com>

## v0.4.18

[compare changes](https://gitlab.satoshiengineering.com/satoshiengineering/lightning-tip-cards/compare/v0.4.17...v0.4.18)

### 🚀 Enhancements

- Add SEO text to home page (2e9b7407)

### 💅 Refactors

- **e2e:** Move the testing of the loading icons to seperate tests (efcc5600)
- **e2e:** Rename test to be more specific (be5db6fe)
- **e2e:** Add 1 sec wait after a withdraw is created (59799af6)

### 🏡 Chore

- Postpone expiry of esbuild audit exception (51648968)
- Npm audit fix (de1dc73b)
- Skip failing test as it there is a problem with the lnbits wallet balances (736aa20d)
- **e2e:** Skip regular failing test (c8a4e8fe)
- Skip failing test as it there is a problem with the lnbits wallet balances" (26ff03eb)
- **e2e:** Add log to see error message in sceenshot for failing test in pipeline (1a91a1cd)
- **e2e:** Skip (another) regular failing test (099acec6)
- **e2e:** Add log to see error message in sceenshot for failing test in pipeline (78c73732)
- **e2e:** Add 1 second wait time between withdraw link creation and call (aed8b368)
- **e2e:** Add npm audit excludes for inefficient Babel code (e671549f)
- **e2e:** Add debug log when withdraw call failed to be visible on screenshot (4ead3c6d)
- Audit fix (ab976ac6)
- Bump esbuild expiry in nsprc (9e4333e1)
- Audit fix (27f818b6)
- Update trpc to stable v11 (6a0c5566)

### ❤️ Contributors

- Dr-erych <dave@satoshiengineering.com>
- Philipp Horwath <fil@satoshiengineering.com>
- Thomas Schagerl <tom@satoshiengineering.com>

## v0.4.17

[compare changes](https://gitlab.satoshiengineering.com/satoshiengineering/lightning-tip-cards/compare/v0.4.16...v0.4.17)

### 🚀 Enhancements

- Add set id faq (01de85ac)

### 🩹 Fixes

- Rethrow if volt vault request does not work or response is not as expected (4c6c73a8)

### 🏡 Chore

- Postpone expiry of esbuild tools audit ignore and update trpc (437f22f5)
- Change the bump-version script to use the default semver behaviour from changelogen (bb2260cf)

### ❤️ Contributors

- Dr-erych <dave@satoshiengineering.com>

## v0.4.15...v0.4.16

[compare changes](https://gitlab.satoshiengineering.com/satoshiengineering/lightning-tip-cards/compare/v0.4.15...v0.4.16)

### 🩹 Fixes

- Pipeline always build and deploy frontend and backend, regardless of changes (8343c254)
- Pipeline always build and deploy frontend and backend, regardless of changes (2ccdb6e0)
- Turning on trpc subscriptions again (f51c855b)
- Try using setInterval i/o setTimeout on PageFunding (2f29e9e7)

### 💅 Refactors

- Login do not use subscriptions (aa452e74)

### 🏡 Chore

- Update packages (5e6b36a1)
- **release:** V0.4.16 (9900f857)

### ❤️ Contributors

- Dr-erych <dave@satoshiengineering.com>
- Thomas Schagerl <tom@satoshiengineering.com>

## v0.4.14...v0.4.15

[compare changes](https://gitlab.satoshiengineering.com/satoshiengineering/lightning-tip-cards/compare/v0.4.14...v0.4.15)

### 🚀 Enhancements

- Per default only load the latest 1000 payments on the statistics page (c80aa6e3)
- Add version number and github link to footer (ced54c3e)
- Add maxDurationMs of 10 minutes when opening trpc subscriptions (6954f533)

### 🩹 Fixes

- Add missing english term (46104ca4)
- Remove sse ping and reconnect timeout after trpc update which includes http2 support (71c12e0c)
- Remove sse ping and reconnect timeout after trpc update which includes http2 support" (92f6b932)
- Commit-msg newline (cecd5564)
- PageLanding do not start loading if no card hash is set (show preview instead) (14cd4a7f)

### 💅 Refactors

- Use GITHUB_LINK from constants (4ac89598)
- **backend:** Handle volt-vault update to v0.0.6 (8ef7fbf7)
- Remove pre-commit hook as all checks are included in pre-push anyways (7cedb7fd)
- PageLanding use polling i/o trpc subscription (50ed49ab)

### 🏡 Chore

- Update trpc to latest (2fac9a73)
- Update trpc (414390c7)
- Update trpc to latest (91789570)
- Update trpc and other packages to latest (4069fa38)
- Npm audit (550be43b)
- Increase nsprc expiration as there is no fix yet (fef618f1)
- **release:** V0.4.15 (0b4512e1)

### ❤️ Contributors

- Thomas Schagerl <tom@satoshiengineering.com>
- Dr-erych <dave@satoshiengineering.com>

## v0.4.13...v0.4.14

[compare changes](https://gitlab.satoshiengineering.com/satoshiengineering/lightning-tip-cards/compare/v0.4.13...v0.4.14)

### 🚀 Enhancements

- Increase min lnurlp amount to 213 so that the amount on the card remains 210 sats (6def327e)
- **frontend:** Improve fee & funding info (499768ca)

### 🩹 Fixes

- Use the new volt-vault route so that withdrawals through private channels become possible again (31128abf)
- **backend:** Increase the test sats amount so that it matches the new lnurlp minimum (bbcfd543)
- Update pinia and fix pinia mock (27afaea2)
- Allow iOS users to close the tooltips by touching outside the trigger (a0bcb568)

### 🏡 Chore

- Update all packages except pinia and tailwind to latest versions, fix failing tests (aa6503c0)
- Add ngrok to vite allowedHosts (5c2d3959)
- **release:** V0.4.14 (91503f53)

### ❤️ Contributors

- Dr-erych <dave@satoshiengineering.com>

## v0.4.12...v0.4.13

[compare changes](https://gitlab.satoshiengineering.com/satoshiengineering/lightning-tip-cards/compare/v0.4.12...v0.4.13)

### 🚀 Enhancements

- Add privacy policy page (95a77afc)
- Place the set printing header dynamically (dd26e405)
- **backend:** Add fee to invoices (2fe29be2)
- **frontend:** Add fee calculation and display to invoice creation forms (08e06ee4)
- **frontend:** Display invoice amount incl. fee (a19733c6)
- **backend:** Add fee estimation check before lnurlw payout (ee1b6d4a)
- **e2e:** Add fee calculation test that expects a fail with a fee that is too high (668b08e8)
- **frontend:** Display the funded amount including fee information for shared and single lnurlp funding (184a64a0)
- **frontend:** Cards in history that have a status that represents an unpaid invoice now display the gross amount (8fede437)
- **frontend:** Display gross amount for open tasks with unpaid invoices (151ade9b)
- **backend:** Add fee info to lnurlp description in lnbits (f371300b)
- Add font size and new preset to set printing (db46fca3)

### 🩹 Fixes

- Polling sometimes fails on iOS Safari, remove timeout and adjust clearing timeouts (48cdb784)
- Never clear a potentially existing polling timeout before starting the next timeout (4debdb68)
- Throw NotFoundError for trpc queries about unsaved setIds so that Telegram sender does not send us a message (c5b9194f)
- **frontend:** Add keyboard listeners to ImageDropZone for better accessibility (44ff1b79)
- Disallow more routes in robots.txt (407838ec)
- Temporarily disable funding (973de7af)
- Temporarily disable funding" (80bc4637)
- Enable doubleSidedPrinting as soon as a backSideImage is selected by the user (2f620fa8)
- **e2e:** Removed randomly failing e2e test that checks if youtube is loaded (7f6e9c77)
- Lnurl needs to point to BACKEND_API_ORIGIN (16fbd4cd)
- **backend:** Rename volt vault env variable (9d06c059)
- **backend:** Increase reconnect timeout and ping interval (c77fd374)
- **backend:** Add feeAmount to SetApi (dff6f4ec)
- Calculate fee for setFunding per card i/o for the total (5d86c7e0)
- **e2e:** Typo in function name (d7e33185)
- **e2e:** Adjust openTasks test (545bb868)
- **frontend:** Add missing reset when deleting set invoice (7ceeb82f)
- **frontend:** Tweak spaces and uppercase letters in texts and add missing texts (9e180bed)
- Lnurlp single card funding: do not display funding info if card is not funded (473aeb3e)

### 💅 Refactors

- **backend:** Clean up import order (20b805fa)
- Import FEE_PERCENTAGE from shared constants and fix typo in function name (5df3333c)
- **backend:** Add feeAmount to OpenTasks (58043fed)

### 🏡 Chore

- Npm audit fix (2381e966)
- Cleanup e2e tests (92a5d663)
- **release:** V0.4.13 (ff190b16)

### ✅ Tests

- **e2e:** Disable the failing navigate-to-youtube test and add a test that only checks for a correct target and href (848831e7)
- **e2e:** Add fee to unfunded landingpage e2e test (e53de118)

### ❤️ Contributors

- Thomas Schagerl <tom@satoshiengineering.com>
- Dr-erych <dave@satoshiengineering.com>

## v0.4.11...v0.4.12

[compare changes](https://gitlab.satoshiengineering.com/satoshiengineering/lightning-tip-cards/compare/v0.4.11...v0.4.12)

### 🚀 Enhancements

- **backend:** Replace express proxy with http-proxy package (b65bddc4)
- **e2e:** Add e2e tests for reloading/updating setsList data (833eb04b)
- **e2e:** Add e2e test for reloading/updating card status data for setsList (76c70bce)
- **e2e:** Delay trpc responses to make sure the reloading animation is visible for testing (6a1831fb)
- **e2e:** Add first e2e tests for history list (da5a92c2)
- **e2e:** Add more history list tests (9fd14007)
- **e2e:** Add logout test for history list (7ca92f99)
- **e2e:** Add e2e tests for history list with data (89693af9)
- **e2e:** Add test for refreshing updated data in history list (62792637)
- **e2e:** Add tests for loading additional history (3e8d2908)
- Improve recommendations on landing page (99b9a3da)
- Add set-printing route and page stub (5088f552)
- Load data that is needed for print page (ad487d50)
- First draft of set-printing (7adf0f62)
- Improve print borders and tweak the layout (674c3cf1)
- Improve mobile layout (30d8b012)
- Add optional gaps and presets for 2 avery zweckform sticker sheets (7088ebbe)
- Harmonize new print layout with cards page (fbfd7837)
- Store printSettings in localStorage (2a933230)
- Add link from cards page to set-printing (65d88a06)
- Display the qr code logo on the new printing page (78d4f97d)
- Backsides only printing (e01a8674)
- Add set id to printed sheets and make set printing data available for sets not owned by the current user (e4716364)
- Reduce size of qr codes on avery45x45 preset (a2fae3cd)

### 🩹 Fixes

- Show loggedOut message on cardsStatusList and hide OpenTasks if there are none (d2ed3d9f)
- Add lnurl to data attribute also for unfunded cards (19839567)
- Always make a login attempt when the window's visibilitystate changes to visible (43cd0407)
- **e2e:** Update cardsSummary data after fixing test data (ab854869)
- Store unsubscribable in ref i/o a simple variable to allow reactivity (f493aebe)
- **e2e:** SetsList.changeCardStatus scroll to sets list to trigger cardsSummary loading (74c5ab0e)
- **backend:** Remove timestamps from CardStatusDto in integration tests (c8f75051)
- **frontend:** Set cards summary loading statuses earlier (29403cda)
- Remove dev console.log (0d8b6380)
- **frontend:** Do not save set/card data if user logged out while fetching (5a82eaf8)
- With an odd number of cards, move last card on the backside to the right (628f9d08)
- Enable ping and reduce timeout to make reconnect on iOS Safari faster (62a81ea7)
- **e2e:** Disable occasionally failing youtube test (a0d5df57)
- **e2e:** Remove the only from development (a278c37a)
- On the funding page restart cardStatus polling on visibilitychange (e3622a30)
- On the set funding page restart cardStatus polling on visibilitychange (55c1ec6d)
- Adjust A4 page height according to paper.css (d505ec20)

### 💅 Refactors

- **backend:** OpenTaskBuilder use class types for lists if i/o interface (399bde85)
- **e2e:** Cypress database plugin createSets task also create cards with unpaid invoices and shared funding (3d42a2c0)
- **e2e:** Reduce sets for a dashboard setsList test (1b3b935b)
- **e2e:** Skip tests that fail in the pipeline (8669fd8c)
- **backend:** Add OpenCardTaskBuilder, split from OpenTaskBuilder (154233e4)
- **backend:** Split OpenSetFundingTaskBuilder from OpenTaskBuilder (608bf826)
- **backend:** Split OpenBulkWithdrawTaskBuilder from OpenTaskBuilder (3515dba8)
- **backend:** OpenTaskBuilder use the split sub-builder (7c885b57)
- **backend:** Clean code OpenBulkWithdrawTaskBuilder (00e3edc2)
- **e2e:** Split slider test into 3 tests (d402bc65)
- **backend:** TRPC Error Handling (e0c1ce31)
- **e2e:** Move generic setsList tests from pages/dashboard.setsList to features/setsList/ (22ea4880)
- Remove timestamps from CardStatusDto (4dc7998f)
- Change full validation to just validate body and footers (3b25e0cb)
- **e2e:** Build tipcards library into a kind of collection similar to tipcardsApi (b57e3c30)
- **e2e:** Move login via ui into tipcards lib and use it in multiple tests (2ea29a39)
- **e2e:** Ignore all errors on youtube.com when navigating there (32a0ebfe)
- **e2e:** Make sure all cards summary checkboxes are rendered before checking the viewport elements (b45dabe0)
- Separate the create route from the login subscription (c8f4b7a1)
- **e2e:** Apply youtube error handling earlier (0838b155)
- **e2e:** Be more conservative in slider tests, to make sure everything is rendered before doing the action (60699fd2)
- Clean up, fix null checks and add error handling for login flow (54f9d553)

### 📖 Documentation

- Update and add badges (b35ae7a5)

### 🏡 Chore

- **backend:** Change error code to UNAUTHORIZED, if accessToken is empty-string or invalid (36354fa5)
- Adjust git commit message check (c8925f7f)
- Update packages except pinia (c3dbf4b6)
- **e2e:** Skip slider test that fails randomly (78a63949)
- **e2e:** Skip randomly failing tests (6ede5919)
- Add print-layout WIP (0fe8342f)
- Add background image to backside (002c051d)
- Add crop marks (b70777aa)
- Change background image and adjust qr code (4fed9dcc)
- Use different qr code for every card (f22c4c93)
- **backend:** Remove deprecated AllowedRefreshTokens (bbe0b3d0)
- Adjust background image & qr code (91fac157)
- **e2e:** Skip SliderDefault swipe test (bd1fc06c)
- **release:** V0.4.12 (dfc27e50)

### ✅ Tests

- **e2e:** Add e2e tests for open tasks list on dashboard (651872ac)
- **e2e:** Add more e2e tests for open tasks list on dashboard (627fa317)
- **e2e:** Add more e2e tests for open tasks list on dashboard (4b4135f9)
- **backend:** Add openTasks trpc route unit test (0fa8ed0e)
- **backend:** Add unit test for OpenBulkWithdrawTask (15f2a5f7)
- **backend:** Add unit test for OpenSetFundingTask (73d52b9b)
- **backend:** Add unit tests for OpenCardTask (ad281621)
- **backend:** Add unit tests for OpenTaskCollection (f2a5a5d2)
- **backend:** Add more unit tests to OpenCardTaskBuilder (88ea46ae)
- **e2e:** Dashboard sets list only display 3 sets (e2d456e3)

### ❤️ Contributors

- Dr-erych <dave@satoshiengineering.com>
- Thomas Schagerl <tom@satoshiengineering.com>
- Philipp Horwath <fil@satoshiengineering.com>

## v0.4.10...v0.4.11

[compare changes](https://gitlab.satoshiengineering.com/satoshiengineering/lightning-tip-cards/compare/v0.4.10...v0.4.11)

### 🚀 Enhancements

- **backend:** Add cardsSummary route to card trpc router (9f44bd6c)
- **frontend:** Dashboard load card summary data from backend (7805ab04)
- **backend:** Add first draft of CardStatusBuilder (4d58e9ad)
- **backend:** CardStatusBuilder load invoices from database (daeafe53)
- **backend:** CardStatusBuilder load lnurlps from database (73b132ce)
- **backend:** CardStatusBuilder load lnurlws from database (d4c34d86)
- Use CardsSummary on cards page (eea26802)
- **frontend:** History on dashboard (faec3ed3)
- **frontend:** Add dates to history list items (4524f9bf)
- **frontend:** PageHistory (b13bfc85)
- **frontend:** Add 404 catch all page and route (a83e3605)
- **backend:** CardStatusForHistoryDto add setId (543e63f2)
- **frontend:** Add count to history lists (10cb63dd)
- **frontend:** Link to set from history (e92ff88a)
- **frontend:** Add OpenTasks (e5bdd1ca)
- **backend:** Add route + builder for open tasks WIP (0127708f)
- **frontend:** OpenTasks frontend module actually use backend route i/o dummy data (486a449a)
- Make Dashboard visible in navigation (07c0aabf)

### 🩹 Fixes

- **e2e:** Adjust sets page related tests (b4efd208)
- **e2e:** Possible fix for invoke error in pipeline (07aba1f7)
- **backend:** GetLatestCardVersions database query (b163e9c4)
- **backend:** Card subscription route handle resolveWithdrawPending as it is currently not resolved by the buidler (c84dff84)
- **frontend:** Handle logged in status for cards summary on dashboard (54c51879)
- **frontend:** Display the old cards summaries during reload (df718251)
- **frontend:** Display loading status i/o error status in set list item cards summary before loading has started (0c2c305e)
- **frontend:** Stop polling when leaving PageFunding (6dde3362)
- **e2e:** Rename task to bulk create sets with pending set funding (b140e938)
- Direct the user to normal single card funding when set-funding a set that only contains one card (d24496d3)
- Add anchor link target to open tasks link on cards page (f0a7442a)
- Sort open tasks descending by created date (f5926775)
- Translate Karten in OpenTasks (41a80113)

### 💅 Refactors

- **e2e:** Move LNURLAuth to cypress task (ec7a09a8)
- **e2e:** Replace LNURLAuth instance with lnurl tasks in tests (f9d9e05f)
- **shared:** Clarify userActionRequired cardStatus category (40dee4d9)
- **frontend:** Convert the useSets store from a composable to a pinia store (41274f54)
- **backend:** Set trpc routes make usage of toTRpcResponse methods (c73c4de0)
- **backend:** Make getJwtValidator non-async (bef9cbd7)
- **backend:** Replace trpc accessToken auth with AccessGuard (39e314a3)
- Refactor integration test profile.test.ts to unit and e2e tests (bedc0e81)
- Integration test set.test.ts to unit test (bfd7c465)
- **e2e:** Move trpc test to trpc dir and rename to auth (35b8dc42)
- **e2e:** Remove unused line (f06efacf)
- **backend:** Remove unused env var LNURL_AUTH_DEBUG (f24bc5d3)
- **backend:** Remove unused code (420b9fcb)
- **backend:** Remove deprecated validateJwt function (009f3733)
- **backend:** Remove outdated jwt mock (9e4dd22d)
- **backend:** CardStatus and CardStatusCollection use CardStatusBuilder in static factory methods (30c55419)
- **backend:** CardStatus.test.ts do not use/test builder but instead use fromData factory to only test CardStatus functionality (580e3a2c)
- **backend:** Clean up CardStatus (46913d8c)
- **backend:** Remove resolveWithdrawPending from CardStatus and instead use a LiveCardStatus class that extends CardStatus (7cebfa57)
- **frontend:** Create reusable ItemsList from SetsList (9321e697)
- **frontend:** OpenTasks and related components (d7a30163)

### 📖 Documentation

- Replace tipcards header image (632bb30a)
- Add http2 directive (36a22a00)

### 🏡 Chore

- Add conventional commit regex (6e3110ab)
- Allow some 'special' chars in the commit message (e892493f)
- Refine conventional commit handling (484d638a)
- Refine git commit hook (a8122198)
- **e2e:** Remove unecessary lines (d07f2e79)
- Fix commit message validation (c61913e1)
- Allow : in commit summary (2d272a28)
- **e2e:** Add accessToken test (f015949c)
- **backend:** Add AccessGuard for user auth via accessToken (98d749a5)
- Update maxListeners of ApplicationEventEmitter to 100 (a41eb770)
- Add npm command to print current changelog (d67644a1)
- Set version in package.json to last tag (f1060f3a)
- Set version in package.json to last tag (15f3a5a1)
- Add changelog to tag message (f5c0b630)
- **release:** V0.4.11 (31fe4882)

### ✅ Tests

- **frontend:** Add unit tests for sets pinia store (267cfeb6)
- **frontend:** Testing sets store and PageSets (90c11558)
- **frontend:** Component test for SetsList (573ef1d5)
- **frontend:** Add error test case to PageSets tests (f72cd1ed)
- **backend:** Add lnurlp and sharedFunding tests to CardStatus unit tests (3b802468)
- **backend:** Add more tests for CardStatusBuilder (802e82f3)
- **e2e:** Add 100 sets with 100 cards test to sets page (6140d9da)
- **frontend:** Component testing for CardsSummary (ffee252e)
- **e2e:** Rename the api interceptor route name according to the last refactoring (f15d7305)
- **frontend:** Component testing for ItemsList (6fe78d4e)
- **e2e:** Add custom set creation for database plugin (b1c4f6a2)
- **backend:** Adjust CardStatusForHistoryCollection test to recognize newly added parameters (9b52bedb)
- **e2e:** Add tests for set lists that check if the sets are ordered (41c8b8a1)
- **e2e:** Add test cases to dashboard setsList e2e tests (99b12428)
- **e2e:** Increase timeout for dashboard setsList element selector (bd7a97d2)
- **e2e:** Increase timeout for dashboard setsList element selector even more (e8f92b3e)
- **e2e:** Add dahsboard cardsSummary tests (691c9b72)
- **e2e:** Add timeouts for failing tests (3a52c447)
- **e2e:** Set all timeouts to 60s globally and remove custom timeouts in the tests (f4fee845)
- **e2e:** Skip one test from the suite dashboard.setsList (2f453883)
- **e2e:** Skip one test from the suite homePageLinks (90adc731)

### 🎨 Styles

- **frontend:** Translations and layout for CardsSummary compontent (bdf07dad)
- **frontend:** Handle cardsSummary loading errors on dashborad (79fe843e)

### ❤️ Contributors

- Dr-erych <dave@satoshiengineering.com>
- Thomas Schagerl <tom@satoshiengineering.com>
- Philipp Horwath <fil@satoshiengineering.com>
- Thespielplatz <informatics@gmx.net>

