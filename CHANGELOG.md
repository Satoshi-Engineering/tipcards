# Changelog


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

