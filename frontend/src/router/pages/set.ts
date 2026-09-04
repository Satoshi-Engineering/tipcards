import type { RouteRecordInfo } from 'vue-router'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
} from '@/router/utils'

export interface SetParamsRaw extends LocalizedRouteParamsRaw {
  setId: string
}

export interface SetParams extends LocalizedRouteParams {
  setId: string
}

export type RouteSet = RouteRecordInfo<
  'set',
  `${localizedRoutePrefix}/set/:setId`,
  SetParamsRaw,
  SetParams
>

export const set = {
  name: 'set',
  path: `${localizedRoutePrefix}/set/:setId`,
  component: () => import('@/pages/PageSet.vue'),
  props: true,
  meta: {
    title: (): false => false, // title will be set in the page component
  },
}
