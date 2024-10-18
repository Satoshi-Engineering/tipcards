import type { RouteRecordInfo } from 'vue-router'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RouteStatistics = RouteRecordInfo<
  'statistics',
  `${localizedRoutePrefix}/statistics`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const statistics = {
  name: 'statistics',
  path: `${localizedRoutePrefix}/statistics`,
  component: () => import('@/pages/statistics/PageStatistics.vue'),
  meta: {
    title: () => 'Statistics',
  },
}
