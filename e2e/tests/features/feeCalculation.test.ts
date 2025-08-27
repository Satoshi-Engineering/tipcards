import { generateCardHash } from '@e2e/lib/api/data/card'
import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'
import tipCardsApi from '@e2e/lib/tipCardsApi'

import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'

const invoice = 'lnbc4u1pne5fx3pp5w2ma9q08eh5t0amgjrnwmyceegn4za7tjnsursq8jmz8alq6rxhqdqqcqzzsxqyz5vqsp5ea4ng42k9kwz6dy8usd7xs37g0g5xlcy69ge7rvdnyquvqhv79zs9p4gqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqysgqa6ej8npz6lxw2em8zlwvwdfh7sdvvvqdgpncvg5lfdwt5r8ked75xsnkutvt43uwwz34psxn4k2l6n6yyt6wu55huz82lknqt65uvccqk8j3w3'

describe('Fee Calculation', () => {
  it('Should fail to pay out, if the estimated fee is too high', () => {
    generateCardHash().then((cardHash) => {
      tipCardsApi.card.fundCardWithInvoice(cardHash, 400)
      const url = new URL(`/api/lnurl/${cardHash}`, BACKEND_API_ORIGIN)
      cy.request({
        url: url.toString(),
        method: 'GET',
      }).then((response) => {
        const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(response.body)
        cy.request({
          url: `${lnurlWithdrawRequest.callback}&k1=${lnurlWithdrawRequest.k1}&pr=${invoice}`,
          failOnStatusCode: false,
        }).then((response) => {
          cy.log(response.body)
          cy.wrap(response.status).should('be.greaterThan', 399)
          cy.wrap(response.body.status).should('equal', 'ERROR')
          cy.wrap(response.body.code).should('equal', 'UnableToFindValidRoute')
        })
      })
    })
  })
})
