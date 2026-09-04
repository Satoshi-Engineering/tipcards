import type { RouteLocationNormalizedLoaded, RouteLocationRaw, RouteRecordInfo } from 'vue-router'

import i18n from '@/modules/initI18n'
import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
} from '@/router/utils'

export interface BulkWithdrawParamsRaw extends LocalizedRouteParamsRaw {
  setId: string
  settings?: string
}

export interface BulkWithdrawParams extends LocalizedRouteParams {
  setId: string
  settings: string
}

export type RouteBulkWithdraw = RouteRecordInfo<
  'bulk-withdraw',
  `${localizedRoutePrefix}/bulk-withdraw/:setId/:settings?`,
  BulkWithdrawParamsRaw,
  BulkWithdrawParams
>

export const bulkWithdraw = {
  name: 'bulk-withdraw',
  path: `${localizedRoutePrefix}/bulk-withdraw/:setId/:settings?`,
  component: () => import('@/pages/bulkWithdraw/PageBulkWithdraw.vue'),
  meta: {
    title: () => i18n.global.t('bulkWithdraw.title'),
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
