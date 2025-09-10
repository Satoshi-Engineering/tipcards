import type { SetDto } from '@shared/data/trpc/SetDto'

import { generateCardHashForSet } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('History list without data', () => {
  it('should refresh when navigating from dashboard to history page', () => {
    // preparation
    tipCardsApi.auth.login()
    createTestData()
    tipCards.dashboard.goto()
    dashboardMakeSureTestDataIsFetchedAndRendered()
    changeTestData()
    tipCardsApi.utils.delayNextTrpcResponse()

    cy.get('a[data-test=link-to-full-history]').click()

    // during fetching the sets, the old data should be displayed
    historyPageOldDataShouldBeDisplayed()
    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--small]').should('be.visible')

    // after fetching the sets, the new data should be displayed
    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--small]').should('not.exist')
    historyPageNewDataShouldBeDisplayed()
  })

  it('should refresh when navigating from history page to dashboard', () => {
    // preparation
    tipCardsApi.auth.login()
    createTestData()
    tipCards.history.goto()
    historyPageMakeSureTestDataIsFetchedAndRendered()
    changeTestData()
    tipCardsApi.utils.delayNextTrpcResponse()

    cy.get('a[data-test=back-link-to-dashboard]').click()

    // during fetching the sets, the old data should be displayed
    dashboardOldDataShouldBeDisplayed()
    cy.get('[data-test=card-status-list] [data-test=items-list-reloading-icon]').should('be.visible')

    // after fetching the sets, the new data should be displayed
    cy.get('[data-test=card-status-list] [data-test=items-list-reloading-icon]').should('not.be.visible')
    dashboardNewDataShouldBeDisplayed()
  })
})

function createTestData() {
  cy.get('@userId').then((userId) => {
    cy.task<SetDto>('db:createSet1', { userId })
    cy.task<SetDto>('db:createSet2', { userId }).then((set) => {
      cy.wrap(set).as('testSet')
    })
  })
}

function dashboardMakeSureTestDataIsFetchedAndRendered() {
  cy.get('[data-test=card-status-list-item]').should('have.length', 3)
}

function historyPageMakeSureTestDataIsFetchedAndRendered() {
  cy.get('[data-test=card-status-list-item]').should('have.length', 4)
}

function changeTestData() {
  cy.get<SetDto>('@testSet').then((set) => {
    generateCardHashForSet(set.id, 2).then((cardHash) => {
      cy.task('db:setFundedCardToLandingPageViewed', cardHash)
    })
  })
}

function dashboardOldDataShouldBeDisplayed() {
  cy.get('[data-test=card-status-list-item]').should('have.length', 3)
  cy.get('[data-test=card-status-list-item-date-landingPageViewed]').should('not.exist')
}

function dashboardNewDataShouldBeDisplayed() {
  cy.get('[data-test=card-status-list-item]').should('have.length', 3)

  // make sure the new data is displayed on top (as the list is sorted by date)
  cy.get('[data-test=card-status-list-item]').eq(0).then($el => {
    cy.wrap($el).find('[data-test=card-status-list-item-date-landingPageViewed]').should('be.visible')
  })
}

function historyPageOldDataShouldBeDisplayed() {
  cy.get('[data-test=card-status-list-item]').should('have.length', 3)
  cy.get('[data-test=card-status-list-item-date-landingPageViewed]').should('not.exist')
}

function historyPageNewDataShouldBeDisplayed() {
  cy.get('[data-test=card-status-list-item]').should('have.length', 4)

  // make sure the new data is displayed on top (as the list is sorted by date)
  cy.get('[data-test=card-status-list-item]').eq(0).then($el => {
    cy.wrap($el).find('[data-test=card-status-list-item-date-landingPageViewed]').should('be.visible')
  })
}
