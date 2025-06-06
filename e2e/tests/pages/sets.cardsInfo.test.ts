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
      cy.task('db:createSetsWithSetFunding', {
        userId,
        numberOfSets,
        numberOfCardsPerSet,
      })
    })
  })

  beforeEach(() => {
    cy.setCookie('refresh_token', refreshToken)
  })

  it(`loads ${numberOfSets} sets with ${numberOfCardsPerSet} cards each`, () => {
    tipCards.sets.goto()

    cy.getTestElement('sets-list-item')
      .should('have.length', numberOfSets)
  })

  it('loads only cards info for sets in viewport', () => {
    gotoSetsPageAndWaitForInitialCardsInfoRequest()

    cy.getTestElement('sets-list-item-cards-summary-userActionRequired').should('have.length.at.least', 4 * Math.min(12, numberOfCardsPerSet))
    setListItemsInViewportHaveCardsInfoLoaded(numberOfCardsPerSet, viewportHeight)

    // items outside of the viewport should not have loaded cards info
    cy.getTestElement('sets-list-item-cards-summary-userActionRequired').should('have.length.at.most', 4 * Math.min(12, numberOfCardsPerSet))
  })

  it('loads cards info for sets in viewport after scrolling', () => {
    gotoSetsPageAndWaitForInitialCardsInfoRequest()

    scrollDownAndWaitForCardsInfoRequest()

    // make sure the userActionRequired checkboxes are rendered before checking items in viewport,
    // as the setListItemsInViewportHaveCardsInfoLoaded loop is written in a way that it will fail if the checkboxes are not rendered before the function is called
    cy.getTestElement('sets-list-item-cards-summary-userActionRequired').should('have.length.at.least', 7 * Math.min(12, numberOfCardsPerSet))
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
  tipCards.sets.goto()
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
