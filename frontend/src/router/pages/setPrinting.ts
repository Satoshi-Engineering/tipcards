import type { RouteRecordInfo } from 'vue-router'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export interface SetPrintingParamsRaw extends LocalizedRouteParamsRaw {
  setId: string
}

export interface SetPrintingParams extends LocalizedRouteParams {
  setId: string
}

export type RouteSetPrinting = RouteRecordInfo<
  'set-printing',
  `${localizedRoutePrefix}/set-printing/:setId`,
  SetPrintingParamsRaw,
  SetPrintingParams,
  AppRouteMeta
>

export const setPrinting = {
  name: 'set-printing',
  path: `${localizedRoutePrefix}/set-printing/:setId`,
  component: () => import('@/pages/setPrinting/PageSetPrinting.vue'),
  props: true,
  meta: {
    title: () => false, // title will be set in the page component
  },
}
