import { generateSets } from '@e2e/lib/api/data/set'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe.skip('Sets Page Cards Info', () => {
  const numberOfSets = 10
  const numberOfCardsPerSet = 10
  const viewportHeight = Cypress.config('viewportHeight')

  let refreshToken = ''

  before(() => {
    tipCardsApi.auth.login().then((newRefreshToken) => {
      refreshToken = newRefreshToken
    })

    const sets = generateSets(numberOfSets, numberOfCardsPerSet)

    tipCardsApi.set.addSetsParallelWithAxios(sets)
    tipCardsApi.set.createInvoicesForSetsParallelWithAxios(sets, 21)
  })

  beforeEach(() => {
    cy.setCookie('refresh_token', refreshToken)
  })

  it(`loads ${numberOfSets} sets with ${numberOfCardsPerSet} cards each`, { taskTimeout: 5000 * numberOfSets }, () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-with-data').find('a')
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
    countSetsListItemsInViewport('itemsInViewportBeforeScroll', viewportHeight)

    scrollDownAndWaitForCardsInfoRequest()
    countSetsListItemsInViewport('itemsInViewportAfterScroll', viewportHeight)

    cy.get('@itemsInViewportBeforeScroll').then((itemsInViewportBeforeScroll) => {
      cy.get('@itemsInViewportAfterScroll').then((itemsInViewportAfterScroll) => {
        const totalItemsInViewport = Math.min(Number(itemsInViewportBeforeScroll) + Number(itemsInViewportAfterScroll), numberOfSets)
        totalNumberOfSetsWithLoadedCardsInfoShouldBeEqual(totalItemsInViewport, numberOfCardsPerSet)
      })
    })
  })
})



const elementIsInViewport = (el: HTMLElement, viewportHeight: number) => {
  const rect = el.getBoundingClientRect()
  return rect.bottom >= 0 && rect.top <= viewportHeight
}

const countSetsListItemsInViewport = (variableName: string, viewportHeight: number) => {
  cy.getTestElement('sets-list-item')
    .then(($setsListItems) => {
      const setsListItemsInViewport = $setsListItems.get().filter((setsListItem) => elementIsInViewport(setsListItem, viewportHeight))
      cy.wrap(setsListItemsInViewport.length).as(variableName)
    })
}

const gotoSetsPageAndWaitForInitialCardsInfoRequest = () => {
  cy.intercept('/trpc/set.getCardsInfoBySetId**').as('apiSetGetCardsInfo')
  tipCards.gotoSetsPage()
  cy.wait('@apiSetGetCardsInfo')
}

const scrollDownAndWaitForCardsInfoRequest = () => {
  cy.intercept('/trpc/set.getCardsInfoBySetId**').as('apiSetGetCardsInfo')
  cy.getTestElement('sets-list-item').eq(-3).scrollIntoView()
  cy.wait('@apiSetGetCardsInfo')
}

const setListItemsInViewportHaveCardsInfoLoaded = (numberOfCardsPerSet: number, viewportHeight: number) => {
  cy.getTestElement('sets-list-item')
    .then(($setsListItems) => {
      const setsListItemsInViewport = $setsListItems.get().filter((setsListItem) => elementIsInViewport(setsListItem, viewportHeight))

      cy.wrap(setsListItemsInViewport).each((setListItem: HTMLElement) => {
        cy.wrap(setListItem).find('[data-test="sets-list-item-cards-info-pending"]').should('have.length', Math.min(12, numberOfCardsPerSet))
      })
    })
}

const totalNumberOfSetsWithLoadedCardsInfoShouldBeEqual = (expectedNumberOfSets: number, numberOfCardsPerSet: number) => {
  cy.getTestElement('sets-list-item-cards-info-pending').should('have.length', expectedNumberOfSets * Math.min(12, numberOfCardsPerSet))
}
