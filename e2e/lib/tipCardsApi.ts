import { login, isLoggedInViaCypress, isLoggedOut, refresh, clearAuth } from '@e2e/lib/api/auth'
import { generateAndAddRandomSet } from '@e2e/lib/api/sets'

export default {
  auth: {
    login,
    refresh,
    isLoggedIn: isLoggedInViaCypress,
    isLoggedOut,
    clearAuth,
  },
  generateAndAddRandomSet,
}
