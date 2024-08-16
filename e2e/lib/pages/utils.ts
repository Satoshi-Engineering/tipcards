export const reload = () => {
  cy.intercept('/api/auth/refresh').as('apiAuthRefresh')
  cy.reload()
  cy.wait('@apiAuthRefresh')
}
