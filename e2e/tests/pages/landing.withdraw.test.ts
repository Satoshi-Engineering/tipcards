import { generateCardHash } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Landing Page', () => {
  it('should use (withdraw from) a funded card', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)

      tipCards.gotoLandingPage(cardHash)
      cy.getTestElement('lightning-qr-code-button-open-in-wallet').then(($button) => {
        const lnurlEncoded = $button.attr('href').split('lightning:')[1]
        tipCardsApi.card.useLnurlWithdraw(cardHash, lnurlEncoded)
      })
      cy.wait(5000) // wait for the next card status polling/update to happen

      cy.getTestElement('greeting-recently-withdrawn').should('exist')
    })
  })
})
