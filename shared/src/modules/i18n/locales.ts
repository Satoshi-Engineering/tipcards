const LOCALES_LOCAL = {
  en: {
    name: 'English',
    dir: 'ltr',
    fiat: 'USD',
  },
  de: {
    name: 'Deutsch',
    dir: 'ltr',
    fiat: 'EUR',
  },
  es: {
    name: 'Español',
    dir: 'ltr',
    fiat: 'EUR',
  },
  he: {
    name: 'עברית',
    dir: 'rtl',
    fiat: 'EUR',
  },
  ru: {
    name: 'Русский',
    dir: 'ltr',
    fiat: 'EUR',
  },
  hi: {
    name: 'हिन्दी',
    dir: 'ltr',
    fiat: 'USD',
  },
  id: {
    name: 'Bahasa Indonesia',
    dir: 'ltr',
    fiat: 'USD',
  },
}

export type LocaleCode = keyof typeof LOCALES_LOCAL

export const LOCALE_CODES = Object.keys(LOCALES_LOCAL) as LocaleCode[]
export const LOCALES = LOCALES_LOCAL as Record<LocaleCode, typeof LOCALES_LOCAL[LocaleCode]>

export default LOCALES
