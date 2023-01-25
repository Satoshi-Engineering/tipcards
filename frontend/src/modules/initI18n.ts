import { nextTick, computed } from 'vue'
import { createI18n } from 'vue-i18n'

export const LOCALES = {
  en: {
    name: 'English',
    dir: 'ltr',
  },
  de: {
    name: 'Deutsch',
    dir: 'ltr',
  },
  es: {
    name: 'Español',
    dir: 'ltr',
  },
  he: {
    name: 'עברית',
    dir: 'rtl',
  },
  ru: {
    name: 'Русский',
    dir: 'ltr',
  },
  hi: {
    name: 'हिन्दी',
    dir: 'ltr',
  },
}

export type LocaleCode = keyof typeof LOCALES

const getPreferredLocale = () => {
  for (const lang of navigator.languages) {
    if (Object.keys(LOCALES).includes(lang)) {
      return lang as LocaleCode
    }
    const langShort = lang.split('-')[0]
    if (Object.keys(LOCALES).includes(langShort)) {
      return langShort as LocaleCode
    }
  }
}

export const useI18nHelpers = () => {
  const currentLocale = computed(() => i18n.global.locale.value as LocaleCode)
  const currentTextDirection = computed<'ltr' | 'rtl'>(() => LOCALES[currentLocale.value]?.dir === 'rtl' ? 'rtl' : 'ltr')

  return {
    currentLocale,
    currentTextDirection,
  }
}

const i18n = createI18n({
  legacy: false,
  allowComposition: true,
  fallbackLocale: 'en',
})

const loadLocaleMessages = async (locale: LocaleCode) => {
  const messages = await import(`@/locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, messages.default)
  await nextTick()
}

export const setLocale = async (locale: LocaleCode | undefined = 'en') => {
  if (!i18n.global.availableLocales.includes(locale)) {
    await loadLocaleMessages(locale)
  }
  i18n.global.locale.value = locale
}

(async () => {
  await setLocale(getPreferredLocale())
  await nextTick()
  await loadLocaleMessages('en') // load EN locale so that the fallback terms are available
})()

export default i18n
