import LNURL from '@shared/modules/LNURL/LNURL'

import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'
import { switchBrowserLanguageToEnglish } from './utils'

const LANDING_PAGE_PATH = '/landing'

export const gotoSeoPreview = () => {
  cy.visit(new URL(LANDING_PAGE_PATH, TIPCARDS_ORIGIN).href, {
    onBeforeLoad: switchBrowserLanguageToEnglish,
  })
}

export const gotoPreview = (cardHash: string, lang?: string) => {
  const url = lang != null
    ? new URL(`/${lang}${LANDING_PAGE_PATH}/${cardHash}`, TIPCARDS_ORIGIN)
    : new URL(`${LANDING_PAGE_PATH}/${cardHash}`, TIPCARDS_ORIGIN)
  cy.visit(url.href, {
    onBeforeLoad: switchBrowserLanguageToEnglish,
  })
  cy.waitForSubscription('card-status')
}

export const goto = (cardHash: string) => {
  const url = new URL(`${LANDING_PAGE_PATH}`, TIPCARDS_ORIGIN)
  const lnurl = LNURL.encode(`${TIPCARDS_ORIGIN}/api/lnurl/${cardHash}`).toUpperCase()
  url.searchParams.set('lightning', lnurl)
  cy.visit(url.href, {
    onBeforeLoad: switchBrowserLanguageToEnglish,
  })
  cy.waitForSubscription('card-status')
}
