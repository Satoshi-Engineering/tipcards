import LNURL from '@shared/modules/LNURL/LNURL'

import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const LANDING_PAGE_PATH = '/landing'

export const gotoPreview = (cardHash: string) => {
  cy.intercept('/trpc/card.status**').as('trpcCardStatus')
  cy.visit(new URL(`${LANDING_PAGE_PATH}/${cardHash}`, TIPCARDS_ORIGIN).href)
  cy.wait('@trpcCardStatus')
}

export const goto = (cardHash: string) => {
  cy.intercept('/trpc/card.status**').as('trpcCardStatus')
  const url = new URL(`${LANDING_PAGE_PATH}`, TIPCARDS_ORIGIN)
  const lnurl = LNURL.encode(`${TIPCARDS_ORIGIN}/api/lnurl/${cardHash}`).toUpperCase()
  url.searchParams.set('lightning', lnurl)
  cy.visit(url.href)
  cy.wait('@trpcCardStatus')
}
