import { goto as gotoSetsPage } from './pages/sets'
import {
  goto as gotoUserAccount,
  reload as reloadUserAccount,
} from './pages/userAccount.js'
import {
  goto as gotoHomePage,
} from './pages/home.js'
import {
  isLoggedIn,
  isLoggedOut,
  reloadPage,
} from './pages/utils.js'

export default {
  isLoggedIn,
  isLoggedOut,
  reloadPage,
  gotoSetsPage,
  gotoUserAccount,
  gotoHomePage,
  reloadUserAccount,
}
