import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export interface RouteLanding extends RouteRecordInfo<
  'landing',
  `${localizedRoutePrefix}/landing/:cardHash?`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
> {}

export const landing = {
  name: 'landing',
  path: `${localizedRoutePrefix}/landing/:cardHash?`,
  component: () => import('@/pages/PageLanding.vue'),
  meta: {
    title: () => i18n.global.t('landing.title'),
    backlink: true, // Is only used by BackLinkDeprecated
  },
}
