import { generateCardHashForSet } from '@e2e/lib/api/data/card'
import { generateSetId } from '@e2e/lib/api/data/set'
import tipCards from '@e2e/lib/tipCards'
import { BACKEND_API_ORIGIN, TIPCARDS_ORIGIN } from '@e2e/lib/constants'

describe('Card invoices', () => {
  it('should not be possible to create invoice for card with set-invoice', () => {
    const setId = generateSetId()
    tipCards.gotoPage(new URL(`set-funding/${setId}`, TIPCARDS_ORIGIN))
    cy.get('button[type=submit]').click()
    cy.getTestElement('lightning-qr-code-image').should('exist')

    generateCardHashForSet(setId).then((cardHash) => {
      cy.request({
        method: 'POST',
        url: `${BACKEND_API_ORIGIN}api/invoice/create/${cardHash}`,
        failOnStatusCode: false,
        body: {
          amount: 210,
          text: 'Viel Spaß mit Bitcoin :)',
        },
      }).then((response) => {
        expect(response.status).to.equal(400)
      })
    })
  })

  it('should not be possible to create set-invoice for card with invoice', () => {
    const setId = generateSetId()
    generateCardHashForSet(setId).then((cardHash) => {
      tipCards.gotoPage(new URL(`funding/${cardHash}`, TIPCARDS_ORIGIN))
      cy.get('button[type=submit]').click()
      cy.getTestElement('lightning-qr-code-image').should('exist')
    })

    cy.request({
      method: 'POST',
      url: `${BACKEND_API_ORIGIN}api/set/invoice/${setId}`,
      failOnStatusCode: false,
      body: {
        amountPerCard: 210,
        cardIndices: [0, 1],
        text: 'Viel Spaß mit Bitcoin :)',
      },
    }).then((response) => {
      expect(response.status).to.equal(400)
    })
  })
})
