import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'
import { switchBrowserLanguageToEnglish } from '@e2e/lib/pages/utils'

describe('Web client', () => {
  it('visits the app root url and checks the headline', () => {
    cy.visit(TIPCARDS_ORIGIN.href, {
      onBeforeLoad: switchBrowserLanguageToEnglish,
    })
    cy.contains('h1', 'The easiest way to tip with Bitcoin')
  })
})
