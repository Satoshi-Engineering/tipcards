// load the global Cypress types
/// <reference types="cypress" />

import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'

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

export const loginViaRequests = (generateNewKeys = true) => {
  if (generateNewKeys) {
    createNewKeysAndWrap()
  }

  cy.request({
    url: API_AUTH_CREATE.href,
  }).then((response) => {
    expect(response.body).to.have.nested.property('result.data.json.hash')
    expect(response.body).to.have.nested.property('result.data.json.lnurlAuth')
    const authServiceLoginHash = response.body.result.data.json.hash
    const lnurlAuth = response.body.result.data.json.lnurlAuth

    cy.get('@keyPair').then(function () {
      cy.task<{ callbackUrl: string }>('lnurl:getLNURLAuthCallbackUrl', {
        publicKeyAsHex: this.keyPair.publicKeyAsHex,
        privateKeyAsHex: this.keyPair.privateKeyAsHex,
        lnurlAuth,
      }).then(({ callbackUrl }) => {
        cy.wrap(callbackUrl).as('callbackUrl')
        cy.request({
          url: callbackUrl,
        }).its('status').should('eq', 200)
      })
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

export const createNewKeysAndWrap = () => {
  cy.task<{ publicKeyAsHex: string, privateKeyAsHex: string }>('lnurl:createRandomKeyPair').then((keyPair) => {
    cy.wrap(keyPair).as('keyPair')
  })
}

export const lnurlAuthLoginWithWrappedKeyPair = () => {
  cy.intercept('/auth/trpc/auth.loginWithLnurlAuthHash**').as('trpcLoginWithLnurlAuthHash')
  cy.get('@keyPair').get('@lnurlAuthUrl').then(function () {
    cy.task<{ callbackUrl: string }>('lnurl:getLNURLAuthCallbackUrl', {
      publicKeyAsHex: this.keyPair.publicKeyAsHex,
      privateKeyAsHex: this.keyPair.privateKeyAsHex,
      lnurlAuth: this.lnurlAuthUrl,
    }).then(({ callbackUrl }) => {
      cy.wrap(callbackUrl).as('callbackUrl')
      cy.request({
        url: callbackUrl,
      }).its('status').should('eq', 200)
    })
  })
  cy.wait('@trpcLoginWithLnurlAuthHash')
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
