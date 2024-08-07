import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'

describe('Backend', () => {
  it('call dummy route', () => {
    cy.request('GET', new URL('/api/dummy', BACKEND_API_ORIGIN).href).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.status).to.eq('success')
    })
  })
})
