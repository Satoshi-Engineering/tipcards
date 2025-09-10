/* eslint-disable @typescript-eslint/no-unused-expressions */

import { getCardHashFromSet, goto } from '@e2e/lib/pages/card'
import tipCardsApi from '@e2e/lib/tipCardsApi'
import { SetDto } from '@shared/data/trpc/SetDto'
import LNURL from '@shared/modules/LNURL/LNURL'
import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'

let setId: string

describe('Card Details Page', () => {
  before(() => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task<SetDto>('db:createSet2', { userId }).then((set) => {
        setId = set.id
      })
    })
  })

  it('should show the card preview with the correct card LNURL generated', () => {
    goto('test-card-hash')

    const expectedLnurl = LNURL.encode(
      new URL('/api/lnurl/test-card-hash', BACKEND_API_ORIGIN).href,
    ).toUpperCase()
    cy.getTestElement('card-preview')
      .should('exist')
      .then(($el) => {
        expect($el.attr('data-lnurl').endsWith(
          `?lightning=${expectedLnurl}`,
        )).to.be.true
      })
  })

  it('should show the card details page with status unfunded', () => {
    cy.wrap(getCardHashFromSet(setId, 0)).then((cardHash: string) => {
      goto(cardHash)
    })

    cy.getTestElement('card-status-pill')
      .should('exist')
      .then(($el) => {
        expect($el.attr('data-status'), 'data-status attribute should be unfunded').to.equal('unfunded')
      })
    cy.getTestElement('card-fund-button')
      .should('exist')
  })

  it('should show the card details page with status userActionRequired', () => {
    cy.wrap(getCardHashFromSet(setId, 3)).then((cardHash: string) => {
      goto(cardHash)
    })

    cy.getTestElement('card-status-pill')
      .should('exist')
      .then(($el) => {
        expect($el.attr('data-status-category'), 'data-status-category attribute should be userActionRequired').to.equal('userActionRequired')
      })
    cy.getTestElement('card-user-action-button')
      .should('exist')
  })

  it('should show the card details page with status funded', () => {
    cy.wrap(getCardHashFromSet(setId, 2)).then((cardHash: string) => {
      goto(cardHash)
    })

    cy.getTestElement('card-status-pill')
      .should('exist')
      .then(($el) => {
        expect($el.attr('data-status-category'), 'data-status-category attribute should be funded').to.equal('funded')
      })
    cy.getTestElement('card-amount-display')
      .should('exist')
  })

  it('should show the card details page with status withdrawn', () => {
    cy.wrap(getCardHashFromSet(setId, 1)).then((cardHash: string) => {
      goto(cardHash)
    })

    cy.getTestElement('card-status-pill')
      .should('exist')
      .then(($el) => {
        expect($el.attr('data-status-category'), 'data-status-category attribute should be withdrawn').to.equal('withdrawn')
      })
    cy.getTestElement('card-amount-display')
      .should('exist')
  })
})
