// https://on.cypress.io/api

import { urlWithOptionalTrailingSlash } from './lib/urlHelpers'

const tipCards = new URL(Cypress.env('TIPCARDS_ORIGIN'))

describe('Web client', () => {
  it('visits the app root url and checks the headline', () => {
    cy.visit(tipCards.href)
    cy.contains('h1', 'Lightning TipCards')
  })

  it('navigates to the style-guide page and back to home', () => {
    cy.visit(new URL('/style-guide', tipCards).href)
    cy.contains('h1', 'Lightning TipCards Style Guide')

    // navigate home
    cy.get('header a').first().click()
    cy.url().should(
      'to.match',
      urlWithOptionalTrailingSlash(new URL('/home', tipCards)),
    )

    // navigate to english style guide and home from there
    cy.visit(new URL('/en/style-guide', tipCards).href)
    cy.get('header a').first().click()
    cy
      .url()
      .should(
        'to.match',
        urlWithOptionalTrailingSlash(new URL('/en/home', tipCards)),
      )
  })

  it('navigates to the about page', () => {
    cy.visit(new URL('/style-guide', tipCards).href)
    cy.get('footer a').first().click()
    cy.url().should('contain', '/about')
  })

  it('navigates to satoshiengineering.com', () => {
    cy.visit(new URL('/style-guide', tipCards).href)
    cy.log('url start', cy.url().toString())
    cy.get('footer a').last()
      .invoke('attr', 'target', '_self')
      .click()
    cy.origin('https://satoshiengineering.com', () => {
      cy.url().should('contain', 'satoshiengineering.com')
    })
  })

  it('navigates to the faq page via footer link', () => {
    cy.visit(new URL('/style-guide', tipCards).href)
    cy.get('[data-test="the-most-relevant-faqs"] [data-test="link-faq"]').first().click()
    cy.url().should('contain', '/faqs')
  })

  it('clicks on second faq in most-relevant faqs', () => {
    cy.visit(new URL('/style-guide', tipCards).href)
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(0).should('be.visible')
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(1).should('not.be.visible')

    cy.get('[data-test="the-most-relevant-faqs"] ul li').eq(1).click()
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(0).should('be.visible')
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(1).should('be.visible')

    cy.get('[data-test="the-most-relevant-faqs"] ul li').eq(0).click()
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(0).should('not.be.visible')
    cy.get('[data-test="the-most-relevant-faqs"] ul li p').eq(1).should('be.visible')
  })
})
