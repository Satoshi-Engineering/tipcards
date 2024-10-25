import { generateSet } from '@e2e/lib/api/data/set'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets Page', () => {
  beforeEach(() => {
    tipCardsApi.auth.login()
  })

  it('User should see the empty sets list', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('please-login-section').should('not.exist')
    cy.getTestElement('logged-in').should('exist')
    cy.getTestElement('sets-list-empty').should('exist')
  })

  it('User should access a saved set', () => {
    const randomSetName = Math.random().toString(36).substring(7)
    tipCardsApi.set.generateAndAddRandomSet()
    tipCardsApi.set.generateAndAddRandomSet(randomSetName)

    tipCards.gotoSetsPage()
    cy.getTestElement('sets-list-with-data').find('a').contains(randomSetName).click()

    cy.url().should('contain', '/cards')
    cy.getTestElement('the-layout').contains(randomSetName).should('be.visible')
  })

  it('delivers 100 sets with 100 cards each', () => {
    const numberOfSets = 100
    const numberOfCards = 100

    let t0: number, t1: number, t2: number

    const sets = [...new Array(numberOfSets).keys()].map((i) => {
      const set = generateSet()
      set.settings.setName = `Set ${i.toString().padStart(3, '0')}`
      set.settings.numberOfCards = numberOfCards
      return set
    })

    tipCardsApi.set.addSetsParallel(sets)
    tipCardsApi.set.createInvoicesForSetsParallel(sets, 21)

    cy.then(() => {
      t0 = performance.now()
    })

    cy.intercept('/trpc/set.getCardsInfoBySetId**').as('apiSetGetCardsInfo')
    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-with-data').find('a')
      .should('have.length', numberOfSets)

    cy.then(() => {
      t1 = performance.now()
      cy.log(`Page load excl. cardsInfo took ${t1 - t0} milliseconds.`)
    })

    cy.wait('@apiSetGetCardsInfo')

    cy.getTestElement('sets-list-item')
      .then(($setsListItems) => {
        const setsListItemsInViewport = $setsListItems.get().filter((setsListItem) => elementIsInViewport(setsListItem))
        cy.wrap(setsListItemsInViewport.length).as('itemsInViewportBeforeScroll')

        cy.wrap(setsListItemsInViewport).each((setListItem: HTMLElement) => {
          cy.wrap(setListItem).find('[data-test="sets-list-item-cards-info-pending"]').should('have.length', Math.min(12, numberOfCards))
        })
      })


    cy.getTestElement('sets-list-item').eq(-3).scrollIntoView()

    cy.wait('@apiSetGetCardsInfo')

    cy.getTestElement('sets-list-item')
      .then(($setsListItems) => {
        const setsListItemsInViewport = $setsListItems.get().filter((setsListItem) => elementIsInViewport(setsListItem))
        cy.wrap(setsListItemsInViewport.length).as('itemsInViewportAfterScroll')

        cy.wrap(setsListItemsInViewport).each((setListItem: HTMLElement) => {
          cy.wrap(setListItem).find('[data-test="sets-list-item-cards-info-pending"]').should('have.length', Math.min(12, numberOfCards))
        })
      })

    cy.get('@itemsInViewportBeforeScroll').then((itemsInViewportBeforeScroll) => {
      cy.get('@itemsInViewportAfterScroll').then((itemsInViewportAfterScroll) => {
        const itemsInViewport = Number(itemsInViewportBeforeScroll) + Number(itemsInViewportAfterScroll)
        cy.getTestElement('sets-list-item-cards-info-pending').should('have.length', itemsInViewport * Math.min(12, numberOfCards))
      })
    })

    cy.then(() => {
      t2 = performance.now()
      cy.log(`Page load incl. cardsInfo took ${t2 - t0} milliseconds.`)
    })
  })
})

const elementIsInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  return rect.bottom >= 0 && rect.top <= Cypress.config('viewportHeight')
}
