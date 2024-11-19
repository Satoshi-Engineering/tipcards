import { login } from '@e2e/lib/api/auth'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets Page', () => {
  beforeEach(() => {
    login()
  })

  it('displays the correct set after searching by part of the name when exchanging lower case chars and upper case chars', () => {
    const set1 = tipCardsApi.set.generateAndAddSet('Name of the Set 1')
    const set2 = tipCardsApi.set.generateAndAddSet('Random Set Name Containing 123 !@#$%^&*() Äöüß')

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('NaME conTAINIng 123 !@#$%^&')

    cy.getTestElement('sets-list-item')
      .should('have.length', 1)
      .should('not.contain', set1.settings.setName)
      .should('contain', set2.settings.setName)
  })

  it('displays the correct sets after searching by number of cards', () => {
    const set1 = tipCardsApi.set.generateAndAddSet({ numberOfCards: 10 })
    const set2 = tipCardsApi.set.generateAndAddSet({ numberOfCards: 89 })
    const set3 = tipCardsApi.set.generateAndAddSet({ numberOfCards: 89 })

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('89 cards')

    cy.getTestElement('sets-list-item')
      .should('have.length', 2)
      .should('contain', set2.settings.setName)
      .should('contain', set3.settings.setName)
      .should('not.contain', set1.settings.setName)
  })

  it('displays the correct set after searching by date', () => {
    const set1 = tipCardsApi.set.generateAndAddSet({ created: +new Date('2020-12-01') / 1000, changed: +new Date('2021-01-01') / 1000 })
    tipCardsApi.set.generateAndAddSet()
    tipCardsApi.set.generateAndAddSet()

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('01/01/2021')

    cy.getTestElement('sets-list-item')
      .should('have.length', 1)
      .should('contain', set1.settings.setName)
  })


  it('displays the correct number of sets for a collection containing multiple sets', () => {
    tipCardsApi.set.generateAndAddSet()
    tipCardsApi.set.generateAndAddSet()
    tipCardsApi.set.generateAndAddSet()

    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-sets-count').should('contain', '3 / 3 sets')
  })

  it('displays the correct number of sets after filtering for a string that matches some sets from a collection containing multiple sets', () => {
    tipCardsApi.set.generateAndAddSet('Similar Set 1')
    tipCardsApi.set.generateAndAddSet('Similar Set 2')
    tipCardsApi.set.generateAndAddSet('Different Set 3')

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('similar')

    cy.getTestElement('sets-list-sets-count').should('contain', '2 / 3 sets')
  })

  it('displays the plural of the sets count translation when 0 sets remain filtered from a collection of multiple sets', () => {
    tipCardsApi.set.generateAndAddSet('existent1')
    tipCardsApi.set.generateAndAddSet('existent2')
    tipCardsApi.set.generateAndAddSet('existent3')

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('non-existent')

    cy.getTestElement('sets-list-sets-count').should('contain', '0 / 3 sets')
  })

  it('displays the plural of the sets count translation when 1 set remains filtered from a collection of multiple sets', () => {
    tipCardsApi.set.generateAndAddSet('existent1')
    tipCardsApi.set.generateAndAddSet('existent2')
    tipCardsApi.set.generateAndAddSet('existent3')

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('existent1')

    cy.getTestElement('sets-list-sets-count').should('contain', '1 / 3 sets')
  })

  it('displays the singular of the sets count translation for a collection containing one set', () => {
    tipCardsApi.set.generateAndAddSet('Random Set Name')

    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-sets-count').should('contain', '1 / 1 set')
  })

  it('displays the singular of the sets count translation when 0 sets remain filtered from a collection containing one set', () => {
    tipCardsApi.set.generateAndAddSet()

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('non-existent')

    cy.getTestElement('sets-list-sets-count').should('contain', '0 / 1 set')
  })

  it('displays the plural of the sets count translation when 0 sets remain filtered from a collection of multiple sets', () => {
    tipCardsApi.set.generateAndAddSet('existent1')
    tipCardsApi.set.generateAndAddSet('existent2')

    tipCards.gotoSetsPage()
    cy.getTestElement('input-search').type('non-existent')

    cy.getTestElement('sets-list-sets-count').should('contain', '0 / 2 sets')
  })
})
