import { generateCardHash } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Landing Page', () => {
  it('should load the status of a pending withdraw', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)
      cy.wait(1000) // lnbits does not allow to immediately withdraw the funds
      tipCardsApi.card.withdrawAllSatsFromCard(cardHash)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.getTestElement('get-your-bitcoin').should('exist')
      cy.getTestElement('greeting-recently-withdrawn').should('not.exist')
    })
  })

  it('should load the status of a recently withdrawn card', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)
      cy.wait(1000) // lnbits does not allow to immediately withdraw the funds
      tipCardsApi.card.useFundedCard(cardHash)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.getTestElement('greeting-recently-withdrawn').should('exist')
    })
  })

  it('should load the status of a withdrawn card', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)
      cy.wait(1000) // lnbits does not allow to immediately withdraw the funds
      tipCardsApi.card.useFundedCard(cardHash)
      cy.task('setCardWithdrawnDateIntoPast', cardHash)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.getTestElement('greeting-withdrawn').should('exist')
    })
  })

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
