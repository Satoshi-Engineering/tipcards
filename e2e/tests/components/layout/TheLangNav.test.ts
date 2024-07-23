import { urlWithOptionalTrailingSlash } from '../../lib/urlHelpers'
import LOCALES from '../../../../shared/src/modules/i18n/locales'

const tipCards = new URL(Cypress.env('TIPCARDS_ORIGIN'))

describe('TheLangNav', () => {
  const rootPageButtonText = {
    en: 'Create your TipCards set',
    de: 'Erstelle dein TipCards-Set',
    es: 'Crea tu conjunto de tarjetas de propina',
    he: 'ליצירת כרטיסי טיפ',
    ru: 'Создайте собственный набор ТИП-карт',
    hi: 'अपना टिप कार्ड समूह बनाएं',
    id: 'Buat Set Kartu Tip kamu',
  }

  Object.keys(LOCALES).forEach((languageCode) => {
    it(`click on "${LOCALES[languageCode].name}" lang nav menu item and check if the language of the website changed to "${languageCode}"`, () => {
      cy.visit(new URL('/style-guide', tipCards).href)
      cy.get('header [data-test=the-header-lang-button]').first().click()
      cy.contains(`header nav[data-test=the-lang-nav] [data-test=the-lang-nav-item-${languageCode}]`, LOCALES[languageCode].name)
      cy.get(`header nav[data-test=the-lang-nav] [data-test=the-lang-nav-item-${languageCode}]`).first().click()

      cy.get('header [data-test=the-header-home-button]').first().click()
      cy.get('html').first().should('have.attr', 'lang', languageCode)
      cy.url().should(
        'to.match',
        urlWithOptionalTrailingSlash(new URL(`/${languageCode}`, tipCards)),
      )
      cy.get('button').first().contains(rootPageButtonText[languageCode])
    })
  })
})
