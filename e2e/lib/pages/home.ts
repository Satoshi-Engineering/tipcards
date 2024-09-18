import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const LOGIN_PAGE_URL = new URL('/', TIPCARDS_ORIGIN)

export const goto = () => {
  cy.intercept('/api/auth/refresh').as('apiAuthRefresh')
  cy.visit(LOGIN_PAGE_URL.href)
  cy.wait('@apiAuthRefresh')
}
