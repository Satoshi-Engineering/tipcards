import tipCards from '@e2e/lib/tipCards'

describe('Landing Page', () => {
  it('checks all wallet pages', () => {
    tipCards.gotoLandingPageSeoPreview()

    cy.getTestElement('no-wallet').find('a').each(($a) => {
      const href = $a.attr('href')
      cy.request(href).its('status').should('eq', 200)
    })
  })

  it('checks all stores', () => {
    tipCards.gotoLandingPageSeoPreview()

    cy.getTestElement('use-your-bitcoin').find('a').each(($a) => {
      const href = $a.attr('href')
      cy.request(href).its('status').should('eq', 200)
    })
  })
})
