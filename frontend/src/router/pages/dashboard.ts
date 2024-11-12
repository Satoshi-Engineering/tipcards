import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RouteDashboard = RouteRecordInfo<
  'dashboard',
  `${localizedRoutePrefix}/dashboard`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const dashboard = {
  name: 'dashboard',
  path: `${localizedRoutePrefix}/dashboard`,
  component: () => import('@/pages/dashboard/PageDashboard.vue'),
  meta: {
    title: () => i18n.global.t('dashboard.title'),
  },
}
