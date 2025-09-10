import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets Page', () => {
  beforeEach(() => {
    tipCardsApi.auth.login()
  })

  it('User should see the empty sets list', () => {
    tipCards.sets.goto()

    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('sets-list-message-not-logged-in').should('not.exist')
    cy.getTestElement('sets-list-message-empty').should('exist')
  })

  it('User should access a saved set', () => {
    const randomSetName = Math.random().toString(36).substring(7)
    tipCardsApi.set.generateAndAddSet()
    tipCardsApi.set.generateAndAddSet(randomSetName)

    tipCards.sets.goto()
    cy.getTestElement('sets-list-item').contains(randomSetName).click()

    cy.url().should('contain', '/cards')
    cy.getTestElement('the-layout').contains(randomSetName).should('be.visible')
  })

  it('User should see logged out message after logging out', () => {
    tipCardsApi.auth.clearAuth()

    tipCards.sets.goto()

    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('sets-list-message-not-logged-in').should('exist')
    cy.getTestElement('sets-list-message-empty').should('not.exist')
  })

  it('loads 100 sets and lists them ordered (latest changed first)', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task('db:create100TestSets', { userId })
    })

    tipCards.sets.goto()

    cy.getTestElement('sets-list-item').should('have.length', 100)
    cy.get('[data-test=sets-list] [data-test=sets-list-item-date]').then(($els) => {
      const dates = $els.toArray().map((el) => el.textContent)
      for (let i = 0; i < dates.length - 1; i++) {
        cy.wrap(new Date(dates[i])).should('not.be.lessThan', new Date(dates[i + 1]))
      }
    })
  })
})
