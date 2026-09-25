import { expect, test } from '@playwright/test'

import LOCALES, { LOCALE_CODES, type LocaleCode } from '@shared/modules/i18n/locales.js'

import { urlWithOptionalTrailingSlash } from '../../utils/urlHelpers.js'

test.use({ viewport: { width: 1000, height: 660 } })

test.describe('TheLangNav', () => {
  const rootPageButtonText: Record<LocaleCode, string> = {
    en: 'Create your TipCards set',
    de: 'Erstelle dein TipCards-Set',
    es: 'Crea tu conjunto de TipCards',
    fr: 'Créer votre collection de TipCards',
    he: 'צור את סט ה-TipCards שלך',
    ru: 'Создать набор ТИП-карт',
    hi: 'अपना TipCards सेट बनाएं',
    id: 'Buat set TipCards Anda',
  }

  LOCALE_CODES.forEach((languageCode) => {
    test(`click on "${LOCALES[languageCode].name}" lang nav menu item and check if the language of the website changed to "${languageCode}"`, async ({ page }) => {
      await page.goto('/style-guide')
      await page.locator('header [data-test=the-header-lang-button]').first().click()

      const languageItem = page.locator(`header nav[data-test=the-lang-nav] [data-test=the-lang-nav-item-${languageCode}]`).first()
      await expect(languageItem).toContainText(LOCALES[languageCode].name)
      await languageItem.click()

      await page.locator('header [data-test=the-header-home-button]').first().click()
      await expect(page.locator('html').first()).toHaveAttribute('lang', languageCode)
      await expect(page).toHaveURL(urlWithOptionalTrailingSlash(`/${languageCode}`))
      await expect(page.locator('[data-test=button-create]').first()).toContainText(rootPageButtonText[languageCode])
    })
  })
})
