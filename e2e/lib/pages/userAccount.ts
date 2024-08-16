import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

import { reload as reloadGeneric } from './utils.js'

const USER_ACOUNT_PAGE_URL = new URL('/user-account', TIPCARDS_ORIGIN)

export const goto = () => {
  cy.intercept('/trpc/profile.get**').as('trpcProfileGet')
  cy.visit(USER_ACOUNT_PAGE_URL.href)
  cy.wait('@trpcProfileGet')
}

export const reload = () => {
  cy.intercept('/trpc/profile.get**').as('trpcProfileGet')
  reloadGeneric()
  cy.wait('@trpcProfileGet')
}
