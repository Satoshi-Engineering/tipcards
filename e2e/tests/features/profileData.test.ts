import { generateProfile } from '@e2e/lib/api/data/profile'

import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('profileData', () => {
  const profile = generateProfile()

  beforeEach(() => {
    tipCardsApi.auth.login()
  })

  it('user navigates to account page and enters their data', () => {
    tipCards.gotoUserAccount()

    cy.getTestElement('profile-form-account-name').find('input').type(`{selectAll}${profile.accountName}`)
    cy.getTestElement('profile-form-display-name').find('input').type(`{selectAll}${profile.displayName}`)
    cy.getTestElement('profile-form-email').find('input').type(`{selectAll}${profile.email}`)
    cy.getTestElement('profile-form').submit()
    cy.get('header [data-test=the-header-main-nav-button]').click()

    cy.getTestElement('the-main-nav-logged-in').should('contain', profile.displayName)

    tipCards.reloadUserAccount()

    cy.getTestElement('profile-form-account-name').find('input').should('have.value', profile.accountName)
    cy.getTestElement('profile-form-display-name').find('input').should('have.value', profile.displayName)
    cy.getTestElement('profile-form-email').find('input').should('have.value', profile.email)
  })
})
