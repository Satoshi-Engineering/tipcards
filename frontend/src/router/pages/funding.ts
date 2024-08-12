import type { RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export interface RouteFunding extends RouteRecordInfo<
  'funding',
  `${localizedRoutePrefix}/funding/:cardHash`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
> {}

export const funding = {
  name: 'funding',
  path: `${localizedRoutePrefix}/funding/:cardHash`,
  component: () => import('@/pages/PageFunding.vue'),
  meta: {
    title: () => i18n.global.t('funding.title'),
    backlink: true, // Is only used by BackLinkDeprecated
  },
}
