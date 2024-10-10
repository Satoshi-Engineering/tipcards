import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const LANDING_PAGE_PATH = '/landing'

export const gotoPreview = (cardHash: string) => {
  cy.intercept('/api/auth/refresh').as('apiAuthRefresh')
  cy.visit(new URL(`${LANDING_PAGE_PATH}/${cardHash}`, TIPCARDS_ORIGIN).href)
  cy.wait('@apiAuthRefresh')
}
