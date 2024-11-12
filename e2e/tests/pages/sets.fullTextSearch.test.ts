import { Set } from '@shared/data/api/Set'
import LNURLAuth from '@shared/modules/LNURL/LNURLAuth'

import { generateSet } from '@e2e/lib/api/data/set'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

let lnurlAuth: LNURLAuth

describe('Sets Page - Full Text Search', () => {
  const singleSetName = 'Single Find Set'
  const multipleSetPartName = 'Multiple Find Set'
  const multipleSetPartNameCount = 3
  const singleDate = '01/01/1970'
  const singleDateTimestamp = 0
  let singleDateSet: Set
  const numberOfCardsCount = 66
  let numberOfCardsCountSet: Set
  const setNames = []

  before(() => {
    setNames.push(singleSetName)
    for (let i = 0; i < multipleSetPartNameCount; i++) {
      setNames.push(`${multipleSetPartName} ${i}`)
    }

    tipCardsApi.auth.login()
    cy.get('@lnurlAuth').then(function () {
      lnurlAuth = this.lnurlAuth
    })

    const sets = setNames.map((setName) => generateSet({ name: setName }))
    singleDateSet = generateSet({ created: singleDateTimestamp })
    sets.push(singleDateSet)
    numberOfCardsCountSet = generateSet({ numberOfCards: numberOfCardsCount })
    sets.push(numberOfCardsCountSet)
    sets.forEach((set) => { tipCardsApi.set.addSet(set) })
  })

  beforeEach(() => {
    tipCardsApi.auth.wrapLNURLAuth(lnurlAuth)
    tipCardsApi.auth.login(false)
  })

  it.skip('should find one set', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('input-search').clear()
    cy.getTestElement('input-search').type(singleSetName) // Needs to be extra test line, because .clear() triggers an update of the page
    cy.getTestElement('sets-list-item').should('have.length', 1)
    cy.getTestElement('sets-list-item').find('[data-test=sets-list-item-name]').should('have.text', singleSetName)
  })

  it.skip('should find multiple sets', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('input-search').clear()
    cy.getTestElement('input-search').type(multipleSetPartName) // Needs to be extra test line, because .clear() triggers an update of the page
    cy.getTestElement('sets-list-item').should('have.length', multipleSetPartNameCount).each((element) => {
      cy.wrap(element).should('include.text', multipleSetPartName)
    })
  })

  it('should find one set via date', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('input-search').clear()
    cy.getTestElement('input-search').type(singleDate) // Needs to be extra test line, because .clear() triggers an update of the page
    cy.getTestElement('sets-list-item').should('have.length', 1)
    cy.getTestElement('sets-list-item').find('[data-test=sets-list-item-name]').should('have.text', singleDateSet.settings.setName)
  })


  it('should find one set via number of cards', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('input-search').clear()
    cy.getTestElement('input-search').type(numberOfCardsCount.toString()) // Needs to be extra test line, because .clear() triggers an update of the page
    cy.getTestElement('sets-list-item').should('have.length', 1)
    cy.getTestElement('sets-list-item').find('[data-test=sets-list-item-name]').should('have.text', numberOfCardsCountSet.settings.setName)
  })
})
