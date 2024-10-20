import LNURL from '@shared/modules/LNURL/LNURL'

import { generateCardHash } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

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
})
