import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

import { gotoPage, gotoPageWithExpiredAccessToken } from './utils'

export const gotoCardsPage = (setId: string) => {
  cy.intercept('/api/set/**').as('apiCardsSet')
  gotoPage(new URL(`/cards/${setId}`, TIPCARDS_ORIGIN))
  cy.wait('@apiCardsSet')
}

export const gotoNewSetPage = () => {
  cy.intercept('/api/set/**').as('apiCardsSet')
  gotoPage(new URL('/cards', TIPCARDS_ORIGIN))
  cy.wait('@apiCardsSet')
}

export const gotoNewSetPageWithExpiredAccessToken = () => {
  cy.intercept('/api/set/**').as('apiCardsSet')
  gotoPageWithExpiredAccessToken(new URL('/cards', TIPCARDS_ORIGIN))
  cy.wait('@apiCardsSet')
}
