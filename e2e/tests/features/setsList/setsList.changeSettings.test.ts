import type { SetDto } from '@shared/data/trpc/SetDto'

import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets List with sets data', () => {
  it('should update the changed set name on the dashboard page', () => {
    // preparation
    tipCardsApi.auth.login()
    createTestData()
    tipCards.sets.goto()
    makeSureTestDataIsFetchedAndRendered()
    changeTestSetData()
    tipCardsApi.utils.delayNextTrpcResponse()

    // action
    cy.get('a[data-test=back-link-to-dashboard]').click()

    // during fetching the sets, the old data should be displayed
    cy.get('[data-test=items-list-reloading-icon]').should('be.visible')
    oldDataShouldBeDisplayed()

    // after fetching the sets, the new data should be displayed
    newDataShouldBeDisplayed()
    cy.get('[data-test=items-list-reloading-icon]').should('not.be.visible')
  })

  it('should update the changed set name on the sets page', () => {
    // preparation
    tipCardsApi.auth.login()
    createTestData()
    tipCards.dashboard.goto()
    makeSureTestDataIsFetchedAndRendered()
    changeTestSetData()
    tipCardsApi.utils.delayNextTrpcResponse()

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
    cy.task<SetDto[]>('db:createSetsWithSetFunding', {
      userId,
      numberOfSets: 2,
      numberOfCardsPerSet: 8,
    }).then((sets) => {
      // grab the older set, it should be on the second position in the setsList
      const testSet = sets.sort((setA, setB) => new Date(setA.changed).getTime() - new Date(setB.changed).getTime())[0]
      cy.wrap(testSet).as('testSet')
    })
  })
}

function makeSureTestDataIsFetchedAndRendered() {
  cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 2)
}

function changeTestSetData() {
  cy.get<SetDto>('@testSet').then((set) => {
    cy.task('db:updateSetName', {
      setId: set.id,
      name: 'Updated Set Name',
    })
  })
}

function oldDataShouldBeDisplayed() {
  cy.get<SetDto>('@testSet').then((set) => {
    cy.get('[data-test=sets-list] [data-test=sets-list-item]').eq(1).should('contain', set.settings.name)
  })
}

function newDataShouldBeDisplayed() {
  cy.get('[data-test=sets-list] [data-test=sets-list-item]').eq(0).should('contain', 'Updated Set Name')
}
