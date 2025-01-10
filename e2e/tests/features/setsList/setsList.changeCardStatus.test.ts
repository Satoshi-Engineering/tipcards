import type { SetDto } from '@shared/data/trpc/SetDto'

import { generateCardHashForSet } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets List with sets data', () => {
  it('should update a cards summary checkbox on the dashboard page', () => {
    // preparation
    tipCardsApi.auth.login()
    createTestData()
    tipCards.gotoSetsPage()
    makeSureTestDataIsFetchedAndRendered()
    changeTestSetData()
    tipCardsApi.delayNextTrpcResponse()

    // action
    cy.get('a[data-test=back-link-to-dashboard]').click()

    // during fetching the sets, the old data should be displayed
    cy.get('[data-test=items-list-reloading-icon]').should('be.visible')
    oldDataShouldBeDisplayed()

    // action 2 - we need to scoll into view to trigger fetching of the cardsSummary
    cy.wait('@delayedRequest')
    cy.get('[data-test=sets-list]').scrollIntoView()

    // after fetching the sets, the new data should be displayed
    newDataShouldBeDisplayed()
    cy.get('[data-test=items-list-reloading-icon]').should('not.be.visible')
  })

  it('should update a cards summary checkbox on the sets page', () => {
    // preparation
    tipCardsApi.auth.login()
    createTestData()
    tipCards.gotoDashboardPage()
    cy.get('[data-test=sets-list]').scrollIntoView()
    makeSureTestDataIsFetchedAndRendered()
    changeTestSetData()
    tipCardsApi.delayNextTrpcResponse()

    // action
    cy.get('a[data-test=link-to-all-my-sets]').click()

    // during fetching the sets, the old data should be displayed
    cy.get('[data-test=items-list-reloading-icon]').should('be.visible')
    oldDataShouldBeDisplayed()

    // after fetching the sets, the new data should be displayed
    newDataShouldBeDisplayed()
    cy.get('[data-test=items-list-reloading-icon]').should('not.be.visible')
  })
})

function createTestData() {
  cy.get('@userId').then((userId) => {
    cy.task<SetDto>('db:createSet1', { userId }).then((set) => {
      cy.wrap(set).as('testSet')
    })
  })
}

function makeSureTestDataIsFetchedAndRendered() {
  cy.get('[data-test=sets-list-item-cards-summary-funded]').should('exist')
}

function changeTestSetData() {
  cy.get<SetDto>('@testSet').then((set) => {
    generateCardHashForSet(set.id, 0).then((cardHash) => {
      cy.task('db:setFundedCardToWithdrawn', cardHash)
    })
  })
}

function oldDataShouldBeDisplayed() {
  cy.get('[data-test=sets-list-item-cards-summary-funded]').should('exist')
  cy.get('[data-test=sets-list-item-cards-summary-withdrawn]').should('not.exist')
}

function newDataShouldBeDisplayed() {
  cy.get('[data-test=sets-list-item-cards-summary-funded]').should('not.exist')
  cy.get('[data-test=sets-list-item-cards-summary-withdrawn]').should('exist')
}
