import { TIPCARDS_ORIGIN, TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'

import { gotoPage } from './utils'

const SETS_PAGE_URL = new URL('/sets', TIPCARDS_ORIGIN)

export const goto = () => {
  cy.intercept('/trpc/set.getLatestChanged**').as('apiSet')
  gotoPage(SETS_PAGE_URL)

  cy.getCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  }).then((cookie) => {
    if (cookie?.value) {
      cy.wait('@apiSet')
    }
  })
}
