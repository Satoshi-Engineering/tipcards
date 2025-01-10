import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets List with sets data', () => {
  it.skip('should login and display the user\'s sets aferwards', () => {
    // preparation: create a user and a set w/o logging in
    cy.task<{ publicKeyAsHex: string, privateKeyAsHex: string }>('lnurl:createRandomKeyPair').then((keyPair) => {
      cy.wrap(keyPair).as('keyPair')
      cy.task<{ userId: string, lnurlAuthKey: string }>('db:createUser', { lnurlAuthKey: keyPair.publicKeyAsHex }).then(({ userId }) => {
        cy.task('db:createSetsWithSetFunding', {
          userId,
          numberOfSets: 5,
          numberOfCardsPerSet: 8,
        }).then((sets) => {
          cy.wrap(sets).as('sets')
        })
      })
    })
    tipCards.dashboard.goto()

    // log in via ui
    cy.get('[data-test=sets-list-message-not-logged-in] button').click()
    cy.getTestElement('lightning-qr-code-image').then(($el) => {
      const lnurlAuthUrl = $el.attr('href').substring(10)
      cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
    })
    tipCardsApi.auth.lnurlAuthLoginWithWrappedKeyPair()
    cy.getTestElement('modal-login-close-button').click()

    // the sets should get loaded
    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 3)
  })

  it('loads a single set on the dashboard page', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.generateAndAddSet()

    tipCards.dashboard.goto()

    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 1)
  })

  it('loads a single set on the sets page', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.generateAndAddSet()

    tipCards.sets.goto()

    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 1)
  })
})
