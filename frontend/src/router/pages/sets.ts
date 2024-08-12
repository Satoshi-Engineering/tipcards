import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export interface RouteSets extends RouteRecordInfo<
  'sets',
  `${localizedRoutePrefix}/sets`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
> {}

export const sets = {
  name: 'sets',
  path: `${localizedRoutePrefix}/sets`,
  component: () => import('@/pages/PageSets.vue'),
  meta: {
    title: () => i18n.global.t('sets.title'),
  },
}
