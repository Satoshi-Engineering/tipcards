import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'en',
  legacy: false,
  allowComposition: true,
  fallbackLocale: 'en',
  missingWarn: false,
})
config.global.plugins = [...config.global.plugins, i18n]
