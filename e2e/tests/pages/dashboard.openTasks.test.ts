import type { SetDto } from '@shared/data/trpc/SetDto'

import { generateCardHashForSet } from '@e2e/lib/api/data/card'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('OpenTasks', () => {
  it('should not render if logged out', () => {
    tipCards.dashboard.goto()

    cy.getTestElement('open-tasks').should('not.exist')
  })

  it('should not render if the user is logged in and there are no todos', () => {
    tipCardsApi.auth.login()

    tipCards.dashboard.goto()

    cy.getTestElement('open-tasks').should('not.exist')
  })

  it('should not render, even if a set is created', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.generateAndAddSet()

    tipCards.dashboard.goto()

    cy.getTestElement('open-tasks').should('not.exist')
  })

  it('should load the open tasks on login', () => {
    // preparation: create a user and a set w/o logging in
    tipCardsApi.auth.createUserWithoutLogin()
    tipCardsApi.set.createSet(5)
    tipCards.dashboard.goto()

    // log in via ui
    cy.getTestElement('login-banner-login').click()
    tipCards.auth.loginViaModalLogin()

    // the tasks should get loaded
    cy.getTestElement('open-tasks').should('exist')
  })

  it('should show all todos for the 100 test sets', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task<SetDto[]>('db:create100TestSets', { userId }).then((sets) => {
        cy.wrap(sets).as('sets')
      })
    })

    tipCards.dashboard.goto()

    cy.getTestElement('open-tasks').should('contain.text', '9337 cards with open tasks')
    cy.getTestElement('open-tasks-list').should('exist')
    cy.get('[data-test=open-tasks-list] li').should('have.length', 102)
    cy.get('@sets').then(function () {
      const set4 = this.sets.find((set: SetDto) => set.settings.name === 'Set 004')
      const set5 = this.sets.find((set: SetDto) => set.settings.name === 'Set 005')
      const set7 = this.sets.find((set: SetDto) => set.settings.name === 'Set 007')
      const set40 = this.sets.find((set: SetDto) => set.settings.name === 'BulkSet 040')

      // invoice
      generateCardHashForSet(set7.id, 0).then((cardHash) => {
        cy.get(`[data-test-card-hash="${cardHash}"]`)
          .should('exist')
          .should('contain.text', 'Waiting for payment')
          .should('contain.text', '210 sats')
      })

      // expired invoice
      generateCardHashForSet(set7.id, 1).then((cardHash) => {
        cy.get(`[data-test-card-hash="${cardHash}"]`)
          .should('exist')
          .should('contain.text', 'Invoice expired')
          .should('contain.text', '210 sats')
      })

      // lnurlp
      generateCardHashForSet(set4.id, 7).then((cardHash) => {
        cy.get(`[data-test-card-hash="${cardHash}"]`)
          .should('exist')
          .should('contain.text', 'Waiting for payment')
          .should('contain.text', '0 sats')
      })

      // shared funding
      generateCardHashForSet(set7.id, 2).then((cardHash) => {
        cy.get(`[data-test-card-hash="${cardHash}"]`)
          .should('exist')
          .should('contain.text', 'Shared funding in progress')
          .should('contain.text', '0 sats')
      })

      // shared funding with sats
      generateCardHashForSet(set7.id, 3).then((cardHash) => {
        cy.get(`[data-test-card-hash="${cardHash}"]`)
          .should('exist')
          .should('contain.text', 'Shared funding in progress')
          .should('contain.text', '210 sats')
      })

      // bulk funding
      cy.get(`[data-test-set-id="${set40.id}"]`)
        .should('exist')
        .should('contain.text', 'Set invoice expired')
        .should('contain.text', 'BulkSet 040')
        .should('contain.text', '100 cards')
        .should('contain.text', '2100 sats')

      // bulk withdraw
      cy.get(`[data-test-set-id="${set5.id}"]`)
        .should('exist')
        .should('contain.text', 'Reclaim in progress')
        .should('contain.text', 'Set 005')
        .should('contain.text', '29 cards')
        .should('contain.text', '6090 sats')
    })
  })

  it('it should sort the todos (desc by created)', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task<SetDto[]>('db:create100TestSets', { userId }).then((sets) => {
        cy.wrap(sets).as('sets')
      })
    })

    tipCards.dashboard.goto()

    cy.getTestElement('open-card-task-created').then(($els) => {
      const dates = $els.toArray().map((el) => el.textContent)
      for (let i = 0; i < dates.length - 1; i++) {
        cy.wrap(new Date(dates[i])).should('not.be.lessThan', new Date(dates[i + 1]))
      }
    })
  })

  it('it should link to funding page', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task<SetDto>('db:createSet7', { userId }).then((set) => {
        cy.wrap(set).as('set')
      })
    })
    tipCards.dashboard.goto()

    cy.get('@set').then(function () {
      const set7 = this.set
      generateCardHashForSet(set7.id, 0).then((cardHash) => {
        cy.get(`[data-test-card-hash="${cardHash}"]`).click()

        cy.url().should('contain', `/funding/${cardHash}`)
      })
    })
  })

  it('it should link to set funding page', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task<SetDto[]>('db:createSetsWithSetFunding', {
        userId,
        numberOfSets: 1,
        numberOfCardsPerSet: 8,
      }).then((sets) => {
        cy.wrap(sets).as('sets')
      })
    })
    tipCards.dashboard.goto()

    cy.get('@sets').then(function () {
      const setId = this.sets[0].id
      cy.get(`[data-test-set-id="${setId}"]`).click()

      cy.url().should('contain', `/set-funding/${setId}`)
    })
  })

  it('it should link to bulk withdraw page', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task<SetDto>('db:createSet5', { userId }).then((set) => {
        cy.wrap(set).as('set')
      })
    })
    tipCards.dashboard.goto()

    cy.get('@set').then(function () {
      cy.get(`[data-test-set-id="${this.set.id}"]`).click()

      cy.url().should('contain', `/bulk-withdraw/${this.set.id}`)
    })
  })

  it('it should remove the remove the task if its resolved', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task<SetDto[]>('db:createSetsWithSetFunding', {
        userId,
        numberOfSets: 1,
        numberOfCardsPerSet: 8,
      }).then((sets) => {
        cy.wrap(sets).as('sets')
      })
    })
    tipCards.dashboard.goto()
    cy.get('@sets').then(function () {
      const setId = this.sets[0].id
      cy.get(`[data-test-set-id="${setId}"]`).click()
    })

    cy.get('button[data-test=set-funding-reset-invoice]').click()
    tipCards.dashboard.goto()

    cy.getTestElement('open-tasks').should('not.exist')
  })
})
