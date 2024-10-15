import { generateCardHash, generateCardHashForSet } from '@e2e/lib/api/data/card'
import { generateSetId } from '@e2e/lib/api/data/set'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Landing Page', () => {
  it('should redirect to the funding page, if the card does not exist', () => {
    generateCardHash().then((cardHash) => {

      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
    })
  })

  it('should redirect to the funding page, if an unpaid invoice exists', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.createInvoiceForCardHash(cardHash, 210)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
      cy.getTestElement('funding-invoice').should('contain', '210 sats')
    })
  })

  it('should redirect to the funding page, if a lnurlp link for the card exists', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.createLnurlpLinkForCardHash(cardHash)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
      cy.getTestElement('funding-lnurlp').should('exist')
    })
  })

  it('should redirect to the funding page, if a shared funding lnurlp link exists', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.createSharedFundingForCardHash(cardHash)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
      cy.getTestElement('funding-shared').should('exist')
    })
  })

  it('should redirect to the funding page, if a set funding invoice exists', () => {
    const setId = generateSetId()
    tipCardsApi.set.createInvoiceForSet(setId)
    generateCardHashForSet(setId).then((cardHash) => {

      tipCards.gotoLandingPagePreview(cardHash)

      cy.url().should('contain', `/funding/${cardHash}`)
      cy.getTestElement('funding-set').should('exist')
    })
  })

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

  it('should show locked by bulkWithdraw', () => {
    const setId = generateSetId()
    tipCardsApi.set.fundSet(setId)
    generateCardHashForSet(setId).then((cardHash) => {
      tipCardsApi.bulkWithdraw.startBulkWithdraw(cardHash)

      tipCards.gotoLandingPage(cardHash)

      cy.url().should('contain', `/landing/${cardHash}`)
      cy.getTestElement('greeting-is-locked-by-bulk-withdraw').should('exist')
    })
  })

  it('should reset a bulkWithdraw', () => {
    const setId = generateSetId()
    tipCardsApi.set.fundSet(setId)
    generateCardHashForSet(setId).then((cardHash) => {
      tipCardsApi.bulkWithdraw.startBulkWithdraw(cardHash)

      tipCards.gotoLandingPage(cardHash)
      cy.getTestElement('reset-bulk-withdraw').click()

      cy.url().should('contain', `/landing/${cardHash}`)
      cy.getTestElement('greeting-funded-headline').should('exist')
      cy.getTestElement('greeting-funded-bitcoin-amount').should('contain', '0.00000210 BTC')
    })
  })

  it('should load the status of a recently withdrawn card', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 210)
      cy.wait(1000) // lnbits does not allow to immediately withdraw the funds
      tipCardsApi.card.withdrawAllSatsFromCard(cardHash)

      tipCards.gotoLandingPagePreview(cardHash)

      cy.getTestElement('greeting-recently-withdrawn').should('exist')
    })
  })
})
