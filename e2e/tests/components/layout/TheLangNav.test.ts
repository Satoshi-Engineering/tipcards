import { urlWithOptionalTrailingSlash } from '../../lib/urlHelpers'

const tipCards = new URL(Cypress.env('TIPCARDS_ORIGIN'))

describe('TheLangNav', () => {
  const rootPageButtonTextEnglish = 'Create your TipCards set'
  const rootPageButtonTextGerman = 'Erstelle dein TipCards-Set'
  const languageCodeEnglish = 'en'
  const languageCodeGerman = 'de'

  it('click on a lang nav menu item should change the language of the website', () => {
    cy.visit(new URL(`/${languageCodeEnglish}`, tipCards).href)
    cy.get('button').first().contains(rootPageButtonTextEnglish)
    cy.get('html').first().should('have.attr', 'lang', languageCodeEnglish)

    cy.visit(new URL(`/${languageCodeEnglish}/style-guide`, tipCards).href)
    cy.get('header button').first().click()
    cy.get(`header nav a[href$='${languageCodeGerman}/style-guide']`).first().click()

    cy.get('header a').first().click()
    cy.get('button').first().contains(rootPageButtonTextGerman)
    cy.get('html').first().should('have.attr', 'lang', languageCodeGerman)
    cy.url().should(
      'to.match',
      urlWithOptionalTrailingSlash(new URL(`/${languageCodeGerman}`, tipCards)),
    )
  })
})
