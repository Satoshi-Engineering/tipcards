import { generateCardHash } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Landing Page', () => {
  it('should redirect to funding page if the card does not exist', () => {
    generateCardHash().then((cardHash) => {
      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
    })
  })

  it('should should redirect to the invoice for an unfunded card with invoice', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.createInvoiceForCardHash(cardHash, 210)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
      cy.getTestElement('funding-invoice-text').should('contain', '210 sats')
    })
  })

  it('should should redirect to the lnurlp link for an unfunded card with lnurlp link', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.createLnurlpLinkForCardHash(cardHash)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
      cy.getTestElement('funding-lnurlp').should('contain', 'Scan the QR code with your wallet app')
    })
  })

  it('should show the default landing page for a funded card', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.getTestElement('greeting-funded-headline').should('contain', 'Congratulations!')
      cy.getTestElement('greeting-funded-bitcoin-amount').should('contain', '0.00000210 BTC')
    })
  })

  it('should rewrite the url to cardHash from /landing?lightning=lnurl', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)

      tipCards.gotoLandingPage(cardHash)

      cy.url().should('contain', `/landing/${cardHash}`)
      cy.getTestElement('greeting-funded-headline').should('contain', 'Congratulations!')
      cy.getTestElement('greeting-funded-bitcoin-amount').should('contain', '0.00000210 BTC')
    })
  })

  it('should load the status of a recently withdrawn card', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)
      cy.wait(1000) // lnbits does not allow to immediately withdraw the funds
      tipCardsApi.card.withdrawAllSatsFromCard(cardHash)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.getTestElement('greeting-recently-withdrawn').should('contain', 'Your QR code has just been used')
    })
  })
})
