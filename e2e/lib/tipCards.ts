import {
  goto as gotoHomePage,
} from './pages/home.js'
import {
  gotoSeoPreview as gotoLandingPageSeoPreview,
  goto as gotoLandingPage,
  gotoPreview as gotoLandingPagePreview,
} from './pages/landing.js'
import { goto as gotoSetsPage } from './pages/sets'
import {
  goto as gotoUserAccount,
  reload as reloadUserAccount,
} from './pages/userAccount.js'
import {
  isLoggedIn,
  isLoggedOut,
  reloadPage,
} from './pages/utils.js'
import {
  gotoPage,
} from './pages/utils.js'

export default {
  isLoggedIn,
  isLoggedOut,
  reloadPage,
  gotoPage,
  gotoSetsPage,
  gotoUserAccount,
  gotoHomePage,
  gotoLandingPageSeoPreview,
  gotoLandingPage,
  gotoLandingPagePreview,
  reloadUserAccount,
}
