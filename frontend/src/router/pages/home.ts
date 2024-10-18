import type { RouteRecordInfo } from 'vue-router'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
} from '@/router/utils'

export type RouteHome = RouteRecordInfo<
  'home',
  localizedRoutePrefix,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams
>

export const home = {
  name: 'home',
  path: localizedRoutePrefix,
  component: () => import('@/pages/home/PageHome.vue'),
}
