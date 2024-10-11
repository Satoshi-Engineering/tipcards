import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'

export const reloadPage = () => {
  cy.intercept('/auth/trpc/auth.refreshRefreshToken**').as('apiAuthRefresh')
  cy.reload()
  cy.wait('@apiAuthRefresh')
}

export const gotoPage = (page: URL) => {
  cy.intercept('/auth/trpc/auth.refreshRefreshToken**').as('apiAuthRefresh')
  cy.visit(page.href)
  cy.wait('@apiAuthRefresh')
}

export const isLoggedIn = () => {
  cy.getCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  }).should('exist')
}

export const isLoggedOut = () => {
  cy.getCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  }).should('not.exist')
}
