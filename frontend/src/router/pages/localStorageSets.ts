import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RouteLocalStorageSets = RouteRecordInfo<
  'local-storage-sets',
  `${localizedRoutePrefix}/local-storage-sets`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const localStorageSets = {
  name: 'local-storage-sets',
  path: `${localizedRoutePrefix}/local-storage-sets`,
  component: () => import('@/pages/PageLocalStorageSets.vue'),
  meta: {
    title: () => i18n.global.t('sets.title'),
  },
}
