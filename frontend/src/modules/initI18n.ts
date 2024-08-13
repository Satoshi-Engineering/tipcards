import { computed } from 'vue'
import { createI18n } from 'vue-i18n'

import en from '@/locales/en.json'

import LOCALES, { LOCALE_CODES, type LocaleCode } from '@shared/modules/i18n/locales'

export const useI18nHelpers = () => {
  const currentLocale = computed(() => i18n.global.locale.value as LocaleCode)
  const currentTextDirection = computed<'ltr' | 'rtl'>(() => LOCALES[currentLocale.value]?.dir === 'rtl' ? 'rtl' : 'ltr')
  const currentFiat = computed(() => LOCALES[currentLocale.value]?.fiat || 'EUR')

  return {
    currentLocale,
    currentTextDirection,
    currentFiat,
  }
}

export const setLocale = async (locale: LocaleCode | undefined = 'en') => {
  if (!i18n.global.availableLocales.includes(locale)) {
    await loadLocaleMessages(locale)
  }
  i18n.global.locale.value = locale
}

const getPreferredLocale = (): LocaleCode | undefined => {
  for (const lang of navigator.languages) {
    const locale = LOCALE_CODES.find((code) => lang === code || lang.startsWith(`${code}-`))
    if (locale != null) {
      return locale
    }
  }
}

const i18n = createI18n({
  locale: 'en',
  legacy: false,
  allowComposition: true,
  fallbackLocale: 'en',
  warnHtmlMessage: false,
})
i18n.global.setLocaleMessage('en', en)

const loadLocaleMessages = async (locale: LocaleCode) => {
  if (locale === 'en') {
    return
  }
  const messages = await import(`@/locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, messages.default)
}

(async () => {
  const preferredLocale = getPreferredLocale()
  await setLocale(preferredLocale)
})()

export default i18n
