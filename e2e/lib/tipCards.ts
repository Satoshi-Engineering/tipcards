import * as cards from './pages/cards.js'
import * as dashboard from './pages/dashboard.js'
import * as history from './pages/history.js'
import * as home from './pages/home.js'
import * as landingPage from './pages/landing.js'
import * as sets from './pages/sets.js'
import * as userAccount from './pages/userAccount.js'
import * as utils from './pages/utils.js'

export default {
  ...cards,
  gotoDashboardPage: dashboard.goto,
  gotoHistoryPage: history.goto,
  gotoHomePage: home.goto,
  gotoLandingPageSeoPreview: landingPage.gotoSeoPreview,
  gotoLandingPage: landingPage.goto,
  gotoLandingPagePreview: landingPage.gotoPreview,
  gotoSetsPage: sets.goto,
  gotoUserAccount: userAccount.goto,
  reloadUserAccount: userAccount.reload,
  ...utils,
}
