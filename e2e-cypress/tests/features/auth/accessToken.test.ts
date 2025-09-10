import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'
import tipCardsApi from '@e2e/lib/tipCardsApi'

const API_AUTH_REFRESH = new URL('/auth/trpc/auth.refreshRefreshToken', TIPCARDS_AUTH_ORIGIN)

describe('accessToken', () => {
  it('should not be able to get an access token, if the user is logged out', () => {
    cy.request({
      url: API_AUTH_REFRESH.href,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })

  it('should get an access token', () => {
    tipCardsApi.auth.login()

    cy.request({
      url: API_AUTH_REFRESH.href,
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.nested.property('result.data.json.accessToken')
      const accessToken = response.body.result.data.json.accessToken
      cy.task<boolean>('jwt:validateAccessToken', { accessToken }).then((result) => {
        expect(result).to.eq(true)
      })
    })
  })
})
