import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/modules/polyfill.randomUUID'
import '@/assets/css/main.css'
import initAuth from '@/modules/initAuth'
import initApiAuthInterceptors from '@/modules/initApiAuthInterceptors'
import i18n from '@/modules/initI18n'
import router from '@/router'
import App from '@/App.vue'
import {
  LINK_PRIVACY_POLICY, LINK_LEGAL_NOTICE,
  SUPPORT_EMAIL,
  LINK_LINKED_IN, LINK_X, LINK_INSTAGRAM,
} from '@/constants'

const app = createApp(App)
app.use(i18n)

app.use(createPinia())
app.use(router)

;[
  { key: 'linkPrivacyPolicy', value: LINK_PRIVACY_POLICY },
  { key: 'linkLegalNotice', value: LINK_LEGAL_NOTICE },
  { key: 'supportEmail', value: SUPPORT_EMAIL },
  { key: 'linkLinkedIn', value: LINK_LINKED_IN },
  { key: 'linkX', value: LINK_X },
  { key: 'linkInstagram', value: LINK_INSTAGRAM },
].forEach(({ key, value })=> {
  app.provide(key, value)
})

app.mount('#app')

initAuth()
initApiAuthInterceptors()
