import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'

const API_PUBLIC_KEY = new URL('/auth/api/publicKey', TIPCARDS_AUTH_ORIGIN)

describe('Auth API - public Key', () => {
  it('should return public key', () => {
    cy.request({
      url: API_PUBLIC_KEY.href,
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.nested.property('status', 'success')
      expect(response.body).to.have.nested.property('data')
      const publicKey = response.body.data
      const publicKeyAsLines = publicKey.split('\n')
      expect(publicKeyAsLines[0]).to.eq('-----BEGIN PUBLIC KEY-----')
      expect(publicKeyAsLines.slice(-2)).to.include('-----END PUBLIC KEY-----')
    })
  })
})
