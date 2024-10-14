import { generateCardHash } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Landing Page', () => {
  it('should redirect to funding page if the card does not exist', () => {
    cy.then(async () => {
      const cardHash = await generateCardHash()

      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
    })
  })

  it('should should redirect to the invoice for an unfunded card with invoice', () => {
    cy.then(async () => {
      const cardHash = await generateCardHash()
      tipCardsApi.createInvoiceForCardHash(cardHash, 210)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
      cy.getTestElement('funding-invoice-text').should('contain', '210 sats')
    })
  })

  it('should show the default landing page for a funded card', () => {
    cy.then(async () => {
      const cardHash = await generateCardHash()
      tipCardsApi.createInvoiceForCardHash(cardHash, 210).then((response) => {
        const invoice = response.body.data
        tipCardsApi.lnbitsWallet.payInvoice(cardHash, invoice)
      })

      tipCards.gotoLandingPagePreview(cardHash)

      cy.getTestElement('greeting-funded-headline').should('contain', 'Congratulations!')
      cy.getTestElement('greeting-funded-bitcoin-amount').should('contain', '0.00000210 BTC')
    })
  })

  it('should rewrite the url to cardHash from /landing?lightning=lnurl', () => {
    cy.then(async () => {
      const cardHash = await generateCardHash()
      tipCardsApi.createInvoiceForCardHash(cardHash, 210).then((response) => {
        const invoice = response.body.data
        tipCardsApi.lnbitsWallet.payInvoice(cardHash, invoice)
      })

      tipCards.gotoLandingPage(cardHash)

      cy.url().should('contain', `/landing/${cardHash}`)
      cy.getTestElement('greeting-funded-headline').should('contain', 'Congratulations!')
      cy.getTestElement('greeting-funded-bitcoin-amount').should('contain', '0.00000210 BTC')
    })
  })

  it('should load the status of a recently withdrawn card', () => {
    cy.then(async () => {
      const cardHash = await generateCardHash()
      tipCardsApi.createInvoiceForCardHash(cardHash, 210).then((response) => {
        const invoice = response.body.data
        tipCardsApi.lnbitsWallet.payInvoice(cardHash, invoice)
      })
      cy.wait(1000) // lnbits does not allow to immediately withdraw the funds
      tipCardsApi.withdrawAllSatsFromCard(cardHash)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.getTestElement('greeting-recently-withdrawn').should('contain', 'Your QR code has just been used')
    })
  })
})
