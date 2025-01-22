import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RoutePrivacyPolicy = RouteRecordInfo<
  'privacy-policy',
  `${localizedRoutePrefix}/privacy-policy`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const privacyPolicy = {
  name: 'privacy-policy',
  path: `${localizedRoutePrefix}/privacy-policy`,
  component: () => import('@/pages/PagePrivacyPolicy.vue'),
  meta: {
    title: () => i18n.global.t('privacyPolicy.title'),
    backlink: true, // Is only used by BackLinkDeprecated
  },
}
