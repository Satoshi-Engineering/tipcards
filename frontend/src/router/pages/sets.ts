import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RouteSets = RouteRecordInfo<
  'sets',
  `${localizedRoutePrefix}/sets`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const sets = {
  name: 'sets',
  path: `${localizedRoutePrefix}/sets`,
  component: () => import('@/pages/sets/PageSets.vue'),
  meta: {
    title: () => i18n.global.t('sets.title'),
  },
}
