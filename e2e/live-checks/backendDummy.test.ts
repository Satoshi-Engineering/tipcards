// https://on.cypress.io/api

describe('Backend', () => {
  it('call dummy route', () => {
    cy.request('GET', `${Cypress.env('BACKEND_API_ORIGIN')}/api/dummy`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.status).to.eq('success')
    })
  })
})
