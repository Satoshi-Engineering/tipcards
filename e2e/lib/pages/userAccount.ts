import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

import { gotoPage, reloadPage as reloadGeneric } from './utils.js'

const USER_ACOUNT_PAGE_URL = new URL('/user-account', TIPCARDS_ORIGIN)

export const goto = () => {
  cy.intercept('/trpc/profile.get**').as('trpcProfileGet')
  gotoPage(USER_ACOUNT_PAGE_URL)
  cy.wait('@trpcProfileGet')
}

export const reload = () => {
  cy.intercept('/trpc/profile.get**').as('trpcProfileGet')
  reloadGeneric()
  cy.wait('@trpcProfileGet')
}
