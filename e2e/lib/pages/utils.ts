import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'

export const reloadPage = () => {
  cy.intercept('/auth/trpc/auth.refreshRefreshToken**').as('apiAuthRefresh')
  cy.reload()
  cy.wait('@apiAuthRefresh')
  cy.getTestElement('the-layout').should('exist')
}

export const gotoPage = (page: URL) => {
  cy.intercept('/auth/trpc/auth.refreshRefreshToken**').as('apiAuthRefresh')
  cy.visit(page.href, {
    onBeforeLoad: switchBrowserLanguageToEnglish,
  })
  cy.wait('@apiAuthRefresh')
  cy.getTestElement('the-layout').should('exist')
}

export const gotoPageWithExpiredAccessToken = (page: URL) => {
  cy.getCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  }).then((cookie) => {
    cy.task<string>('jwt:generateExpiredAccessToken', {
      refreshToken: cookie.value,
    }).then((accessToken) => {
      cy.intercept(
        { url: '/auth/trpc/auth.refreshRefreshToken**', times: 1 },
        [{ result: { data: { json: { accessToken } } } } ],
      ).as('apiAuthRefresh')
    })
  })
  cy.visit(page.href, {
    onBeforeLoad: switchBrowserLanguageToEnglish,
  })
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

export const switchBrowserLanguageToEnglish = (win: Cypress.AUTWindow) => {
  Object.defineProperty(win.navigator, 'language', { value: 'en-US' })
  Object.defineProperty(win.navigator, 'languages', { value: ['en-US'] })
}
