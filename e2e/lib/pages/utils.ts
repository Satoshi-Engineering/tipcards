import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'

export const reloadPage = () => {
  cy.intercept('/api/auth/refresh').as('apiAuthRefresh')
  cy.reload()
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
