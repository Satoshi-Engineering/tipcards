import { config } from '@vue/test-utils'

import i18n from '@/modules/initI18n'

config.global.plugins = [...config.global.plugins, i18n]

export default i18n
export const { t } = i18n.global
