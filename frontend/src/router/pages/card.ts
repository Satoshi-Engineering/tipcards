import type { RouteRecordInfo } from 'vue-router'
import i18n from '@/modules/initI18n'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export interface CardParamsRaw extends LocalizedRouteParamsRaw {
  cardHash: string
}

export interface CardParams extends LocalizedRouteParams {
  cardHash: string
}

export type RouteCard = RouteRecordInfo<
  'card',
  `${localizedRoutePrefix}/card/:cardHash`,
  CardParamsRaw,
  CardParams,
  AppRouteMeta
>

export const card = {
  name: 'card',
  path: `${localizedRoutePrefix}/card/:cardHash`,
  component: () => import('@/pages/PageCard.vue'),
  props: true,
  meta: {
    title: () => i18n.global.t('card.title'),
  },
}
