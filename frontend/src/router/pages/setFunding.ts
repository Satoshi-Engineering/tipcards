import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteRecordInfo,
} from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
} from '@/router/utils'

export interface SetFundingParamsRaw extends LocalizedRouteParamsRaw {
  setId: string
  settings?: string
}

export interface SetFundingParams extends LocalizedRouteParams {
  setId: string
  settings: string
}

export type RouteSetFunding = RouteRecordInfo<
  'set-funding',
  `${localizedRoutePrefix}/set-funding/:setId/:settings?`,
  SetFundingParamsRaw,
  SetFundingParams
>

export const setFunding = {
  name: 'set-funding',
  path: `${localizedRoutePrefix}/set-funding/:setId/:settings?`,
  component: () => import('@/pages/PageSetFunding.vue'),
  meta: {
    title: () => i18n.global.t('setFunding.title'),
    backlink: (route: RouteLocationNormalizedLoaded): RouteLocationRaw => ({ // Is only used by BackLinkDeprecated
      name: 'cards',
      params: {
        lang: route.params.lang,
        setId: typeof route.params.setId === 'string' ? route.params.setId : undefined,
        settings: typeof route.params.settings === 'string' ? route.params.settings : undefined,
      },
    }),
  },
}
