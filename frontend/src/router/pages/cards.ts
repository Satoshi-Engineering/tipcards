import type { RouteRecordInfo } from 'vue-router'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export interface CardsParamsRaw extends LocalizedRouteParamsRaw {
  setId?: string
  settings?: string
}

export interface CardsParams extends LocalizedRouteParams {
  setId: string
  settings: string
}

export type RouteCards = RouteRecordInfo<
  'cards',
  `${localizedRoutePrefix}/cards/:setId?/:settings?`,
  CardsParamsRaw,
  CardsParams,
  AppRouteMeta
>

export const cards = {
  name: 'cards',
  path: `${localizedRoutePrefix}/cards/:setId?/:settings?`,
  component: () => import('@/pages/PageCards.vue'),
  meta: {
    title: () => false, // title will be set in the page component
  },
}
