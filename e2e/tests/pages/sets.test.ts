import { generateSet } from '@e2e/lib/api/data/set'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets Page', () => {
  beforeEach(() => {
    tipCardsApi.auth.login()
  })

  it('User should see the empty sets list', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('please-login-section').should('not.exist')
    cy.getTestElement('logged-in').should('exist')
    cy.getTestElement('sets-list-empty').should('exist')
  })

  it('User should access a saved set', () => {
    const randomSetName = Math.random().toString(36).substring(7)
    tipCardsApi.set.generateAndAddRandomSet()
    tipCardsApi.set.generateAndAddRandomSet(randomSetName)

    tipCards.gotoSetsPage()
    cy.getTestElement('sets-list-with-data').find('a').contains(randomSetName).click()

    cy.url().should('contain', '/cards')
    cy.getTestElement('the-layout').contains(randomSetName).should('be.visible')
  })

  it('delivers 100 sets with 100 cards each', () => {
    const numberOfSets = 100
    const numberOfCards = 100

    let t0: number, t1: number, t2: number

    const sets = [...new Array(numberOfSets).keys()].map((i) => {
      const set = generateSet()
      set.settings.setName = `Set ${i.toString().padStart(3, '0')}`
      set.settings.numberOfCards = numberOfCards
      return set
    })

    tipCardsApi.set.addSetsParallel(sets)
    tipCardsApi.set.createInvoicesForSetsParallel(sets, 21)

    cy.then(() => {
      t0 = performance.now()
    })

    cy.intercept('/trpc/set.getStatisticsBySetId**').as('apiSetGetStatistics')
    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-with-data').find('a')
      .should('have.length', numberOfSets)

    cy.then(() => {
      t1 = performance.now()
      cy.log(`Page load excl. statistics took ${t1 - t0} milliseconds.`)
    })

    cy.wait('@apiSetGetStatistics', { timeout: 1000 * numberOfSets })

    cy.getTestElement('sets-list-item-statistics-pending', { timeout: 1000 * numberOfSets })
      .should('have.length.at.least', Math.min(12, numberOfCards))
      .should('have.length.at.most', numberOfSets * Math.min(12, numberOfCards))
    // adjust this with a check for the actual number of visible sets and their statistics items

    cy.then(() => {
      t2 = performance.now()
      cy.log(`Page load incl. statistics took ${t2 - t0} milliseconds.`)
    })
  })
})
