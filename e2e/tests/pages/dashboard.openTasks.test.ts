import type { SetDto } from '@shared/data/trpc/SetDto'

import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('OpenTasks', () => {
  it('should render an empty list if the user is logged out', () => {
    tipCards.gotoDashboardPage()

    cy.getTestElement('open-tasks-list').should('exist')
    cy.get('[data-test="open-tasks-list"] [data-test="items-list-message-no-items"]').should('exist')
  })

  it('should render an empty list if the user is logged in and there are no todos', () => {
    tipCardsApi.auth.login()

    tipCards.gotoDashboardPage()

    cy.getTestElement('open-tasks-list').should('exist')
    cy.get('[data-test="open-tasks-list"] [data-test="items-list-message-no-items"]').should('exist')
  })

  it('should show no todos, even if a set is created', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.generateAndAddSet()

    tipCards.gotoDashboardPage()

    cy.getTestElement('open-tasks-list').should('exist')
    cy.get('[data-test="open-tasks-list"] [data-test="items-list-message-no-items"]').should('exist')
  })

  it('should load the open tasks on login', () => {
    // todo : create sets

    // todo : login

    // todo : check if the open tasks are loaded
  })

  it.only('should show all todos for the 100 test sets', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task<SetDto[]>('db:create100TestSets', { userId }).then((sets) => {
        cy.wrap(sets).as('sets')
      })
    })

    tipCards.gotoDashboardPage()

    cy.getTestElement('open-tasks').should('contain.text', '9337 cards with open tasks')
    cy.getTestElement('open-tasks-list').should('exist')
    cy.get('[data-test=open-tasks-list] li').should('have.length', 102)
    cy.get('@sets').then(function () {
      const set5 = this.sets.find((set: SetDto) => set.settings.name === 'Set 005')
      cy.get(`[data-test-set-id="${set5.id}"]`)
        .should('exist')
        .should('contain.text', 'Reclaim in progress')
        .should('contain.text', 'Set 005')
        .should('contain.text', '29 cards')
        .should('contain.text', '6090 sats')

      const set40 = this.sets.find((set: SetDto) => set.settings.name === 'BulkSet 040')
      cy.get(`[data-test-set-id="${set40.id}"]`)
        .should('exist')
        .should('contain.text', 'Set invoice expired')
        .should('contain.text', 'BulkSet 040')
        .should('contain.text', '100 cards')
        .should('contain.text', '2100 sats')

      // todo : check a single card for:
      // - invoice
      // - expired invoice
      // - lnurlp
      // - shared funding (0 sats)
      // - shared funding (some sats)
    })
  })
})
