import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets Page Cards Info', () => {
  const numberOfSets = 100
  const numberOfCardsPerSet = 100
  const viewportHeight = Cypress.config('viewportHeight')

  let refreshToken = ''

  before(() => {
    tipCardsApi.auth.login().then((newRefreshToken) => {
      refreshToken = newRefreshToken
    })

    cy.get('@userId').then((userId) => {
      cy.task('db:createSets', {
        userId,
        numberOfSets,
        numberOfCardsPerSet,
      })
    })
  })

  beforeEach(() => {
    cy.setCookie('refresh_token', refreshToken)
  })

  it(`loads ${numberOfSets} sets with ${numberOfCardsPerSet} cards each`, { taskTimeout: 5000 * numberOfSets }, () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-item')
      .should('have.length', numberOfSets)
  })

  it('loads cards info for sets in viewport', () => {
    gotoSetsPageAndWaitForInitialCardsInfoRequest()

    setListItemsInViewportHaveCardsInfoLoaded(numberOfCardsPerSet, viewportHeight)
  })

  it('loads cards info for sets in viewport after scrolling', () => {
    tipCards.gotoSetsPage()
    scrollDownAndWaitForCardsInfoRequest()

    setListItemsInViewportHaveCardsInfoLoaded(numberOfCardsPerSet, viewportHeight)
  })

  it('does only load cards info for sets that have been in viewport before and after scrolling', () => {
    gotoSetsPageAndWaitForInitialCardsInfoRequest()
    scrollDownAndWaitForCardsInfoRequest()

    cy.getTestElement('sets-list-item-cards-summary-userActionRequired').should('have.length.lessThan', numberOfSets * Math.min(12, numberOfCardsPerSet))
  })
})

const elementIsInViewport = (el: HTMLElement, viewportHeight: number) => {
  const rect = el.getBoundingClientRect()
  return rect.bottom >= 0 && rect.top <= viewportHeight
}

const gotoSetsPageAndWaitForInitialCardsInfoRequest = () => {
  cy.intercept('/trpc/set.getCardsSummaryForSetId**').as('apiSetGetCardsInfo')
  tipCards.gotoSetsPage()
  cy.wait('@apiSetGetCardsInfo')
}

const scrollDownAndWaitForCardsInfoRequest = () => {
  cy.intercept('/trpc/set.getCardsSummaryForSetId**').as('apiSetGetCardsInfo')
  cy.getTestElement('sets-list-item').eq(-3).scrollIntoView()
  cy.wait('@apiSetGetCardsInfo')
}

const setListItemsInViewportHaveCardsInfoLoaded = (numberOfCardsPerSet: number, viewportHeight: number) => {
  cy.getTestElement('sets-list-item')
    .then(($setsListItems) => {
      const setsListItemsInViewport = $setsListItems.get().filter((setsListItem) => elementIsInViewport(setsListItem, viewportHeight))

      cy.wrap(setsListItemsInViewport).each((setListItem: HTMLElement) => {
        cy.wrap(setListItem).find('[data-test="sets-list-item-cards-summary-userActionRequired"]').should('have.length', Math.min(12, numberOfCardsPerSet))
      })
    })
}
