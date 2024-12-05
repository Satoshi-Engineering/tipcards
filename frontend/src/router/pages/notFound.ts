import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RouteNotFound = RouteRecordInfo<
  'not-found',
  `${localizedRoutePrefix}/not-found`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const notFound = {
  name: 'not-found',
  path: '/:pathMatch(.*)*',
  component: () => import('@/pages/PageNotFound.vue'),
  meta: {
    title: () => i18n.global.t('notFound.title'),
  },
}
