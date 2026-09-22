import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'
import { urlWithOptionalTrailingSlash } from '@e2e/lib/urlHelpers'

describe('localStorageSets', () => {
  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/localStorageSets.test.ts
  it.skip('should render no warning, if no localStorage sets exist', () => {
    cy.visit(new URL('/sets', TIPCARDS_ORIGIN).href)
    cy.get('[data-test="sets-in-local-storage-warning"]').should('not.exist')
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/localStorageSets.test.ts
  it.skip('should render a warning with link, if localStorage sets exist', () => {
    cy.visit(new URL('/sets', TIPCARDS_ORIGIN).href, {
      onBeforeLoad: (window) => {
        window.localStorage.setItem('savedTipCardsSets', JSON.stringify([{
          setId: '54b13b5f-8d0f-4003-bd15-e3002ec5c932',
          settings: 'JTdCJTIybnVtYmVyT2ZDYXJkcyUyMiUzQTglMkMlMjJjYXJkSGVhZGxpbmUlMjIlM0ElMjJIZXklMjAlM0EpJTIyJTJDJTIyY2FyZENvcHl0ZXh0JTIyJTNBJTIyVHJpbmtnZWxkJTIwZiVDMyVCQ3IlMjBkaWNoLiUyMCVGMCU5RiU4RSU4OSU1Q25TY2FubmUlMjBkZW4lMjBRUi1Db2RlJTIwdW5kJTIwZXJmYWhyZSUyQyUyMHdpZSUyMGR1JTIwenUlMjBkZWluZW4lMjBCaXRjb2luJTIwa29tbXN0LiUyMiUyQyUyMmNhcmRzUXJDb2RlTG9nbyUyMiUzQSUyMmJpdGNvaW4lMjIlMkMlMjJzZXROYW1lJTIyJTNBJTIyJTIyJTJDJTIybGFuZGluZ1BhZ2UlMjIlM0ElMjJkZWZhdWx0JTIyJTdE',
          created: '2024-07-30T12:15:48.000Z',
          date: '2024-07-30T12:15:48.000Z',
        }]))
      },
    })
    cy.get('[data-test="sets-in-local-storage-warning"]').should('exist')
    cy.get('[data-test="sets-in-local-storage-warning"] a').click()
    cy.url().should(
      'to.match',
      urlWithOptionalTrailingSlash(new URL('/local-storage-sets', TIPCARDS_ORIGIN)),
    )
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/localStorageSets.test.ts
  it.skip('should navigate to a set page', () => {
    cy.visit(new URL('/local-storage-sets', TIPCARDS_ORIGIN).href, {
      onBeforeLoad: (window) => {
        window.localStorage.setItem('savedTipCardsSets', JSON.stringify([{
          setId: '54b13b5f-8d0f-4003-bd15-e3002ec5c932',
          settings: 'JTdCJTIybnVtYmVyT2ZDYXJkcyUyMiUzQTglMkMlMjJjYXJkSGVhZGxpbmUlMjIlM0ElMjJIZXklMjAlM0EpJTIyJTJDJTIyY2FyZENvcHl0ZXh0JTIyJTNBJTIyVHJpbmtnZWxkJTIwZiVDMyVCQ3IlMjBkaWNoLiUyMCVGMCU5RiU4RSU4OSU1Q25TY2FubmUlMjBkZW4lMjBRUi1Db2RlJTIwdW5kJTIwZXJmYWhyZSUyQyUyMHdpZSUyMGR1JTIwenUlMjBkZWluZW4lMjBCaXRjb2luJTIwa29tbXN0LiUyMiUyQyUyMmNhcmRzUXJDb2RlTG9nbyUyMiUzQSUyMmJpdGNvaW4lMjIlMkMlMjJzZXROYW1lJTIyJTNBJTIyJTIyJTJDJTIybGFuZGluZ1BhZ2UlMjIlM0ElMjJkZWZhdWx0JTIyJTdE',
          created: '2024-07-30T12:15:48.000Z',
          date: '2024-07-30T12:15:48.000Z',
        }, {
          setId: 'bb02fdd5-c556-425e-9464-32d07a8ad327',
          settings: 'JTdCJTIybnVtYmVyT2ZDYXJkcyUyMiUzQTglMkMlMjJjYXJkSGVhZGxpbmUlMjIlM0ElMjJIZXklMjAlM0EpJTIyJTJDJTIyY2FyZENvcHl0ZXh0JTIyJTNBJTIyVHJpbmtnZWxkJTIwZiVDMyVCQ3IlMjBkaWNoLiUyMCVGMCU5RiU4RSU4OSU1Q25TY2FubmUlMjBkZW4lMjBRUi1Db2RlJTIwdW5kJTIwZXJmYWhyZSUyQyUyMHdpZSUyMGR1JTIwenUlMjBkZWluZW4lMjBCaXRjb2luJTIwa29tbXN0LiUyMiUyQyUyMmNhcmRzUXJDb2RlTG9nbyUyMiUzQSUyMmJpdGNvaW4lMjIlMkMlMjJzZXROYW1lJTIyJTNBJTIyJTIyJTJDJTIybGFuZGluZ1BhZ2UlMjIlM0ElMjJkZWZhdWx0JTIyJTdE',
          created: '2024-07-30T12:15:48.000Z',
          date: '2024-07-30T12:15:48.000Z',
        }]))
      },
    })
    cy.get('[data-test="local-storage-sets-list"] a').should('have.length', 2)
    cy.get('[data-test="local-storage-sets-list"] a').first().click()
    cy.url().should('contain', 'cards/54b13b5f-8d0f-4003-bd15-e3002ec5c932')
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/localStorageSets.test.ts
  it.skip('should delete all sets', () => {
    cy.visit(new URL('/local-storage-sets', TIPCARDS_ORIGIN).href, {
      onBeforeLoad: (window) => {
        window.localStorage.setItem('savedTipCardsSets', JSON.stringify([{
          setId: '54b13b5f-8d0f-4003-bd15-e3002ec5c932',
          settings: 'JTdCJTIybnVtYmVyT2ZDYXJkcyUyMiUzQTglMkMlMjJjYXJkSGVhZGxpbmUlMjIlM0ElMjJIZXklMjAlM0EpJTIyJTJDJTIyY2FyZENvcHl0ZXh0JTIyJTNBJTIyVHJpbmtnZWxkJTIwZiVDMyVCQ3IlMjBkaWNoLiUyMCVGMCU5RiU4RSU4OSU1Q25TY2FubmUlMjBkZW4lMjBRUi1Db2RlJTIwdW5kJTIwZXJmYWhyZSUyQyUyMHdpZSUyMGR1JTIwenUlMjBkZWluZW4lMjBCaXRjb2luJTIwa29tbXN0LiUyMiUyQyUyMmNhcmRzUXJDb2RlTG9nbyUyMiUzQSUyMmJpdGNvaW4lMjIlMkMlMjJzZXROYW1lJTIyJTNBJTIyJTIyJTJDJTIybGFuZGluZ1BhZ2UlMjIlM0ElMjJkZWZhdWx0JTIyJTdE',
          created: '2024-07-30T12:15:48.000Z',
          date: '2024-07-30T12:15:48.000Z',
        }, {
          setId: 'bb02fdd5-c556-425e-9464-32d07a8ad327',
          settings: 'JTdCJTIybnVtYmVyT2ZDYXJkcyUyMiUzQTglMkMlMjJjYXJkSGVhZGxpbmUlMjIlM0ElMjJIZXklMjAlM0EpJTIyJTJDJTIyY2FyZENvcHl0ZXh0JTIyJTNBJTIyVHJpbmtnZWxkJTIwZiVDMyVCQ3IlMjBkaWNoLiUyMCVGMCU5RiU4RSU4OSU1Q25TY2FubmUlMjBkZW4lMjBRUi1Db2RlJTIwdW5kJTIwZXJmYWhyZSUyQyUyMHdpZSUyMGR1JTIwenUlMjBkZWluZW4lMjBCaXRjb2luJTIwa29tbXN0LiUyMiUyQyUyMmNhcmRzUXJDb2RlTG9nbyUyMiUzQSUyMmJpdGNvaW4lMjIlMkMlMjJzZXROYW1lJTIyJTNBJTIyJTIyJTJDJTIybGFuZGluZ1BhZ2UlMjIlM0ElMjJkZWZhdWx0JTIyJTdE',
          created: '2024-07-30T12:15:48.000Z',
          date: '2024-07-30T12:15:48.000Z',
        }]))
      },
    })
    cy.get('[data-test="local-storage-sets-list"] a').should('have.length', 2)
    cy.on('window:confirm', () => true)
    cy.get('[data-test="local-storage-sets-clear-all"]').first().click()
    cy.get('[data-test="local-storage-sets-list"] a').should('have.length', 0)
  })
})
