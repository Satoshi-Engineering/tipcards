import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

import { gotoPage } from './utils'

const SETS_PAGE_URL = new URL('/sets', TIPCARDS_ORIGIN)

export const goto = () => {
  cy.intercept('/trpc/set.getAll**').as('apiSet')
  gotoPage(SETS_PAGE_URL)
  cy.wait('@apiSet')
}
