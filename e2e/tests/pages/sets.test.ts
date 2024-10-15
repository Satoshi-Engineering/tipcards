import { generateSet } from '@e2e/lib/api/data/set'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets Page', () => {
  beforeEach(() => {
    tipCardsApi.auth.login()
  })

  it.skip('User should see the empty sets list', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('please-login-section').should('not.exist')
    cy.getTestElement('logged-in').should('exist')
    cy.getTestElement('sets-list-empty').should('exist')
  })

  it.skip('User should access a saved set', () => {
    const randomSetName = Math.random().toString(36).substring(7)
    tipCardsApi.set.generateAndAddRandomSet()
    tipCardsApi.set.generateAndAddRandomSet(randomSetName)

    tipCards.gotoSetsPage()
    cy.getTestElement('sets-list-with-data').find('a').contains(randomSetName).click()

    cy.url().should('contain', '/cards')
    cy.getTestElement('the-layout').contains(randomSetName).should('be.visible')
  })

  it('delivers 50 sets with 100 cards each', () => {
    const numberOfSets = 50
    const numberOfCards = 100

    for (let i = 0; i < numberOfSets; i++) {
      const set = generateSet()
      set.settings.setName = `Set ${i.toString().padStart(3, '0')}`
      set.settings.numberOfCards = numberOfCards
      tipCardsApi.set.addSet(set)
      tipCardsApi.set.createInvoiceForSet(set.id, 21, set.settings.numberOfCards)
    }

    const t0 = performance.now()

    cy.intercept('/trpc/set.getStatisticsBySetId**').as('apiSetGetStatistics')
    tipCards.gotoSetsPage()
    cy.wait('@apiSetGetStatistics').then(() => {

      cy.getTestElement('sets-list-with-data').find('a')
        .should('have.length', numberOfSets)

      cy.get('[data-test="sets-list-with-data"] [data-test="sets-list-item-statistics-pending"]', { timeout: 10000 })
        .should('have.length', numberOfSets * Math.min(12, numberOfCards))

      const t1 = performance.now()
      cy.log(`Page load took ${t1 - t0} milliseconds.`)
    })
  })
})
