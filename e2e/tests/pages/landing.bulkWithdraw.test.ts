import { generateCardHashForSet } from '@e2e/lib/api/data/card'
import { generateSetId } from '@e2e/lib/api/data/set'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Landing Page', () => {
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
})
