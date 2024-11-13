import { login } from '@e2e/lib/api/auth'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'
import { generateSet } from '@e2e/lib/api/data/set'
import { addSet } from '@e2e/lib/api/set'

describe('Sets Page', () => {
  beforeEach(() => {
    login()
  })

  it('displays the correct set after searching by name', () => {
    const randomSetName = 'Random Set Name Containing 123 !@#$%^&*() Äöü'
    tipCardsApi.set.generateAndAddRandomSet()
    tipCardsApi.set.generateAndAddRandomSet(randomSetName)

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type(randomSetName)

    cy.getTestElement('sets-list-with-data').find('a').contains(randomSetName).should('have.length', 1)
    cy.getTestElement('sets-list-sets-count').should('contain', '1 / 2 sets')
  })

  it('displays the correct sets after searching by number of cards', () => {
    const set1 = generateSet()
    const set2 = generateSet()
    const set3 = generateSet()
    set1.settings.numberOfCards = 10
    set2.settings.numberOfCards = 89
    set3.settings.numberOfCards = 89
    addSet(set1)
    addSet(set2)
    addSet(set3)

    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-sets-count').should('contain', '3 / 3 sets')

    cy.getTestElement('input-search').type('89 cards')

    cy.getTestElement('sets-list-with-data').find('a')
      .should('have.length', 2)
      .should('contain', set2.settings.setName)
      .should('contain', set3.settings.setName)

    cy.getTestElement('sets-list-sets-count').should('contain', '2 / 3 sets')
  })

  it('displays the correct set after searching by date', () => {
    const set1 = generateSet()
    set1.created = +new Date('2021-01-01') / 1000
    addSet(set1)
    tipCardsApi.set.generateAndAddRandomSet()
    tipCardsApi.set.generateAndAddRandomSet()

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('01/01/2021')

    cy.getTestElement('sets-list-with-data').find('a')
      .should('have.length', 1)
      .should('contain', set1.settings.setName)

    cy.getTestElement('sets-list-sets-count').should('contain', '1 / 3 sets')
  })

  it('displays the singular of the sets count translation', () => {
    tipCardsApi.set.generateAndAddRandomSet()

    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-sets-count').should('contain', '1 / 1 set')
  })

  it('displays the singular of the sets count translation also when 0 sets remain filtered', () => {
    tipCardsApi.set.generateAndAddRandomSet()

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('non-existent')

    cy.getTestElement('sets-list-sets-count').should('contain', '0 / 1 set')
  })
})
