import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RouteAbout = RouteRecordInfo<
  'about',
  `${localizedRoutePrefix}/about`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const about = {
  name: 'about',
  path: `${localizedRoutePrefix}/about`,
  component: () => import('@/pages/PageAbout.vue'),
  meta: {
    title: () => i18n.global.t('about.title'),
    backlink: true, // Is only used by BackLinkDeprecated
  },
}
