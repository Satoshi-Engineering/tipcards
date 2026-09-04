import type { RouteRecordInfo } from 'vue-router'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
} from '@/router/utils'

export type RouteStatistics = RouteRecordInfo<
  'statistics',
  `${localizedRoutePrefix}/statistics`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams
>

export const statistics = {
  name: 'statistics',
  path: `${localizedRoutePrefix}/statistics`,
  component: () => import('@/pages/statistics/PageStatistics.vue'),
  meta: {
    title: () => 'Statistics',
  },
}
