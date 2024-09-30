import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const SETS_PAGE_URL = new URL('/sets', TIPCARDS_ORIGIN)

export const goto = () => {
  cy.intercept('/api/auth/refresh').as('apiAuthRefresh')
  cy.intercept('/trpc/set.getAll**').as('apiSet')
  cy.visit(SETS_PAGE_URL.href)
  cy.wait('@apiAuthRefresh')
  cy.wait('@apiSet')
}
