import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Dashboard Sets List', () => {
  it('shows a message when the user is logged out', () => {
    tipCards.gotoDashboardPage()

    cy.getTestElement('sets-list-message-not-logged-in').should('exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('should open the modal login', () => {
    tipCards.gotoDashboardPage()

    cy.getTestElement('sets-list-message-not-logged-in').then(($el) => {
      cy.wrap($el.find('button')).click()
    })

    cy.getTestElement('modal-login').should('exist')
  })

  it('loads 0 sets and displays a message when the user is logged in', () => {
    tipCardsApi.auth.login()

    tipCards.gotoDashboardPage()

    cy.getTestElement('sets-list-message-empty').should('exist')
  })

  it('should login and display the user\'s sets aferwards', () => {
    // preparation: create a user and 100 sets w/o logging in
    cy.task<{ publicKeyAsHex: string, privateKeyAsHex: string }>('lnurl:createRandomKeyPair').then((keyPair) => {
      cy.wrap(keyPair).as('keyPair')
      cy.task<{ userId: string, lnurlAuthKey: string }>('db:createUser', { lnurlAuthKey: keyPair.publicKeyAsHex }).then(({ userId }) => {
        cy.task('db:create100TestSets', { userId })
      })
    })
    tipCards.gotoDashboardPage()

    // log in via ui
    cy.getTestElement('sets-list-message-not-logged-in').then(($el) => {
      cy.wrap($el.find('button')).click()
    })
    cy.getTestElement('lightning-qr-code-image').then(($el) => {
      const lnurlAuthUrl = $el.attr('href').substring(10)
      cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
    })
    tipCardsApi.auth.lnurlAuthLoginWithWrappedKeyPair()
    cy.getTestElement('modal-login-close-button').click()

    // the sets should get loaded
    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 3)
  })

  it('loads a single set', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.generateAndAddSet()

    tipCards.gotoDashboardPage()

    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 1)
  })

  it('loads 100 sets and displays the 3 most recently changed (descending)', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task('db:create100TestSets', { userId })
    })

    tipCards.gotoDashboardPage()

    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 3)
    cy.get('[data-test=sets-list] [data-test=sets-list-item-date]').then(($els) => {
      const dates = $els.toArray().map((el) => el.textContent)
      expect(new Date(dates[0])).to.be.greaterThan(new Date(dates[1]))
      expect(new Date(dates[1])).to.be.greaterThan(new Date(dates[2]))
    })
  })
})
