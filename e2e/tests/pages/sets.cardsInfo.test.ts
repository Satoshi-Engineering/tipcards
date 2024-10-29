import { generateSets } from '@e2e/lib/api/data/set'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'
import LNURLAuth from '@shared/modules/LNURL/LNURLAuth'

describe('Sets Page', () => {
  const numberOfSets = 100
  const numberOfCardsPerSet = 100
  const viewportHeight = Cypress.config('viewportHeight')

  let lnurlAuth: LNURLAuth

  before(() => {
    tipCardsApi.auth.createAndWrapLNURLAuth()

    cy.get('@lnurlAuth').then(function () {
      lnurlAuth = this.lnurlAuth
    })

    tipCardsApi.auth.login(false)

    const sets = generateSets(numberOfSets, numberOfCardsPerSet)

    tipCardsApi.set.addSetsParallel(sets)
    cy.task('createInvoicesForSetsParallel', { sets, amountPerCard: 21 })
  })

  beforeEach(() => {
    tipCardsApi.auth.wrapLNURLAuth(lnurlAuth)
    tipCardsApi.auth.login(false)
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
        totalNumberOfSetsWithLoadedCardsInfoShouldBeAtLeast(totalItemsInViewport, numberOfCardsPerSet)
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

const totalNumberOfSetsWithLoadedCardsInfoShouldBeAtLeast = (expectedNumberOfSets: number, numberOfCardsPerSet: number) => {
  cy.getTestElement('sets-list-item-cards-info-pending').should('have.length.at.least', expectedNumberOfSets * Math.min(12, numberOfCardsPerSet))
}
