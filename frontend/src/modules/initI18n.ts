import { nextTick } from 'vue'
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

const i18n = createI18n({
  legacy: false,
  allowComposition: true,
  fallbackLocale: 'en',
})

export const setLocale = async (locale: LocaleCode | undefined = 'en') => {
  const messages = await import(`@/locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, messages.default)
  await nextTick()
  i18n.global.locale.value = locale
}

await setLocale(getPreferredLocale())

export default i18n
