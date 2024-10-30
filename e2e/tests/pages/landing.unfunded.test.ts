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
})
