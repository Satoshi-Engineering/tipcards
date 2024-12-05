import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RouteHistory = RouteRecordInfo<
  'history',
  `${localizedRoutePrefix}/history`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const history = {
  name: 'history',
  path: `${localizedRoutePrefix}/history`,
  component: () => import('@/pages/PageHistory.vue'),
  meta: {
    title: () => i18n.global.t('history.title'),
  },
}
