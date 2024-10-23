import { urlWithOptionalTrailingSlash } from '@e2e/lib/urlHelpers'
import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'
import { switchBrowserLanguageToEnglish } from '@e2e/lib/pages/utils'

describe('Web client', () => {
  it('visits the app root url and checks the headline', () => {
    cy.visit(TIPCARDS_ORIGIN.href, {
      onBeforeLoad: switchBrowserLanguageToEnglish,
    })
    cy.contains('h1', 'The easiest way to tip with Bitcoin')
  })

  it('navigates to the style-guide page and back to home', () => {
    cy.visit(new URL('/style-guide', TIPCARDS_ORIGIN).href)
    cy.contains('h1', 'Lightning TipCards Style Guide')

    // navigate home
    cy.get('header a').first().click()
    cy.url().should(
      'to.match',
      urlWithOptionalTrailingSlash(new URL('/', TIPCARDS_ORIGIN)),
    )

    // navigate to english style guide and home from there
    cy.visit(new URL('/en/style-guide', TIPCARDS_ORIGIN).href)
    cy.get('header a').first().click()
    cy
      .url()
      .should(
        'to.match',
        urlWithOptionalTrailingSlash(new URL('/en/', TIPCARDS_ORIGIN)),
      )
  })

  it('navigates to the about page', () => {
    cy.visit(new URL('/style-guide', TIPCARDS_ORIGIN).href)
    cy.get('footer a').first().click()
    cy.url().should('contain', '/about')
  })

  it('navigates to satoshiengineering.com', () => {
    cy.visit(new URL('/style-guide', TIPCARDS_ORIGIN).href)
    cy.log('url start', cy.url().toString())
    cy.get('footer a').last()
      .invoke('attr', 'target', '_self')
      .click()
    cy.origin('https://satoshiengineering.com', () => {
      cy.url().should('contain', 'satoshiengineering.com')
    })
  })

  it('navigates to the faq page via footer link', () => {
    cy.visit(new URL('/style-guide', TIPCARDS_ORIGIN).href)
    cy.get('[data-test="the-most-relevant-faqs"] [data-test="link-faq"]').first().click()
    cy.url().should('contain', '/faqs')
  })

  it('clicks on second faq in most-relevant faqs', () => {
    cy.visit(new URL('/style-guide', TIPCARDS_ORIGIN).href)
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(0).should('be.visible')
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(1).should('not.be.visible')

    cy.get('[data-test="the-most-relevant-faqs"] ul li button').eq(1).click()
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(0).should('be.visible')
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(1).should('be.visible')

    cy.get('[data-test="the-most-relevant-faqs"] ul li button').eq(0).click()
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(0).should('not.be.visible')
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(1).should('be.visible')
  })
})
