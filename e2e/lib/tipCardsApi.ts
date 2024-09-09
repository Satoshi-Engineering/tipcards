import { login, isLoggedIn, refresh, clearAuth } from '@e2e/lib/api/auth'
import { generateAndAddRandomSet } from '@e2e/lib/api/sets'

export default {
  auth: {
    login,
    refresh,
    isLoggedIn,
    clearAuth,
  },
  generateAndAddRandomSet,
}
