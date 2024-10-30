import { generateCardHash } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Landing Page', () => {
  it('should show the default landing page for a funded card', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.getTestElement('greeting-funded-headline').should('exist')
      cy.getTestElement('greeting-funded-bitcoin-amount').should('contain', '0.00000210 BTC')
    })
  })

  it('should rewrite the url to cardHash from /landing?lightning=lnurl', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)

      tipCards.gotoLandingPage(cardHash)

      cy.url().should('contain', `/landing/${cardHash}`)
      cy.getTestElement('greeting-funded-headline').should('exist')
      cy.getTestElement('greeting-funded-bitcoin-amount').should('contain', '0.00000210 BTC')
    })
  })
})
