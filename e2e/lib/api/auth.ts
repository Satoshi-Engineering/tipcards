// load the global Cypress types
/// <reference types="cypress" />

import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'
import LNURLAuth from '@shared/modules/LNURL/LNURLAuth'

const API_AUTH_CREATE = new URL('/auth/trpc/lnurlAuth.create', TIPCARDS_AUTH_ORIGIN)
const API_AUTH_LOGIN = new URL('/auth/trpc/auth.loginWithLnurlAuthHash', TIPCARDS_AUTH_ORIGIN)
const API_AUTH_REFRESH = new URL('/auth/trpc/auth.refreshRefreshToken', TIPCARDS_AUTH_ORIGIN)

export const login = () => {
  return cy.task<{ userId: string, lnurlAuthKey: string }>('db:createUser').then(({ userId }) => {
    return cy.task<string>('db:insertAllowedSession', {
      userId,
    }).then((sessionId) => {
      return cy.task<string>('jwt:createRefreshToken', {
        userId,
        sessionId,
      }).then((refreshToken) => {
        cy.setCookie('refresh_token', refreshToken)
        return cy.wrap(refreshToken)
      })
    })
  })
}

export const loginViaRequests = (genereateNewLNRULAuth = true) => {
  if (genereateNewLNRULAuth) {
    createAndWrapLNURLAuth()
  }

  cy.request({
    url: API_AUTH_CREATE.href,
  }).then((response) => {
    expect(response.body).to.have.nested.property('result.data.json.hash')
    expect(response.body).to.have.nested.property('result.data.json.lnurlAuth')
    const authServiceLoginHash = response.body.result.data.json.hash
    const lnurl = response.body.result.data.json.lnurlAuth

    cy.get('@lnurlAuth').then(function () {
      const LNURLAuthCallbackUrl = this.lnurlAuth.getLNURLAuthCallbackUrl(lnurl)
      cy.request({
        url: LNURLAuthCallbackUrl.href,
      }).its('status').should('eq', 200)
    })

    cy.then(() => {
      const input = JSON.stringify({
        0: {
          json: {
            hash: authServiceLoginHash,
          },
        },
      })

      cy.request({
        url: API_AUTH_LOGIN.href,
        qs: {
          batch: 1,
          input,
        },
      }).then((response) => {
        expect(response.body).to.have.nested.property('[0].result.data.json.accessToken')
        cy.wrap(response.body[0].result.data.json.accessToken).as('accessToken')
      })
      cy.getCookie('refresh_token', {
        domain: TIPCARDS_AUTH_ORIGIN.hostname,
      }).should('exist')
    })
  })
}

export const getAccessToken = () => {
  cy.request({
    url: API_AUTH_REFRESH.href,
  }).then((response) => {
    expect(response.body).to.have.nested.property('result.data.json.accessToken')
    cy.wrap(response.body.result.data.json.accessToken).as('accessToken')
  })
}

export const isLoggedOut = () => {
  cy.getCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  }).should('not.exist')
}

export const clearAuth = () => {
  cy.clearCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  })
  cy.request({
    url: `${API_AUTH_REFRESH.href}`,
    failOnStatusCode: false,
  }).its('status').should('eq', 401)
}

export const createAndWrapLNURLAuth = () => {
  cy.task<{ publicKeyAsHex: string, privateKeyAsHex: string }>('lnurl:createRandomKeyPair').then(({ publicKeyAsHex, privateKeyAsHex }) => {
    const lnurlAuth = new LNURLAuth({
      publicKeyAsHex,
      privateKeyAsHex,
    })
    cy.wrap(lnurlAuth).as('lnurlAuth')
  })
}

export const wrapLNURLAuth = (lnurlAuth: LNURLAuth) => {
  cy.wrap(lnurlAuth).as('lnurlAuth')
}

export const logoutAllDevices = () => {
  cy.getCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  }).then((cookie) => {
    cy.task('db:logoutAllDevices', {
      refreshToken: cookie.value,
    })
  })
}
