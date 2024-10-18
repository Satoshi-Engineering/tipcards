import LNURL from '@shared/modules/LNURL/LNURL'

import { generateCardHash } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'
import { urlWithOptionalTrailingSlash } from '@e2e/lib/urlHelpers'
import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

describe('Landing Page', () => {
  let cardHash: string
  before(() => {
    generateCardHash().then((cardHashLocal) => {
      cardHash = cardHashLocal
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)
    })
  })

  it('should load the seo preview page', () => {
    tipCards.gotoLandingPageSeoPreview()

    cy.getTestElement('greeting-preview').should('exist')
    cy.getTestElement('what-is-bitcoin-cta').should('exist')
    cy.getTestElement('no-wallet').should('exist')
    cy.getTestElement('use-your-bitcoin').should('exist')
    cy.getTestElement('what-is-bitcoin').should('exist')
    cy.getTestElement('create-your-own-tip-card').should('exist')
  })

  it('should show scroll down to "what is bitcoin" section', () => {
    tipCards.gotoLandingPagePreview(cardHash)
    cy.getTestElement('link-what-is-bitcoin').click()

    cy.getTestElement('what-is-bitcoin').should('exist')
    cy.getTestElement('what-is-bitcoin').should('be.visible')
  })

  it('should show the "get your bitcoin" section', () => {
    tipCards.gotoLandingPagePreview(cardHash)

    cy.getTestElement('get-your-bitcoin').should('exist')
    cy.getTestElement('lightning-qr-code-button-open-in-wallet').then(($button) => {
      const lnurlEncoded = $button.attr('href').split('lightning:')[1]
      const lnurl = LNURL.decode(lnurlEncoded)
      cy.wrap(lnurl).should('include', `/api/lnurl/${cardHash}`)
    })
  })

  it('should show the "no wallet" section', () => {
    tipCards.gotoLandingPagePreview(cardHash)

    cy.getTestElement('no-wallet').should('exist')
    cy.getTestElement('no-wallet').find('a').should('have.length.gte', 2)
  })

  it('should show the "use-your-bitcoin" section', () => {
    tipCards.gotoLandingPagePreview(cardHash)

    cy.getTestElement('use-your-bitcoin').should('exist')
    cy.getTestElement('use-your-bitcoin').find('a').should('have.length.gte', 2)
  })

  it('should show more info about bitcoin', () => {
    tipCards.gotoLandingPagePreview(cardHash, 'de')

    cy.getTestElement('more-bitcoin-explanation').should('exist')
    cy.getTestElement('collapsible-element-content').should('have.length.gte', 2)
    cy.getTestElement('collapsible-element-content').should('not.be.visible')
  })

  it('should open the first extra info about bitcoin', () => {
    tipCards.gotoLandingPagePreview(cardHash, 'de')
    cy.getTestElement('more-bitcoin-explanation').find('button').first().click()

    cy.getTestElement('collapsible-element-content').should('be.visible')
  })

  it('should send the user to "home"', () => {
    tipCards.gotoLandingPagePreview(cardHash)
    cy.getTestElement('create-your-own-tip-card').find('button').click()

    cy.url().should(
      'to.match',
      urlWithOptionalTrailingSlash(new URL('/', TIPCARDS_ORIGIN)),
    )
  })
})
