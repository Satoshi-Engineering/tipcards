import type { RouteRecordInfo } from 'vue-router'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RouteFaqs = RouteRecordInfo<
  'faqs',
  `${localizedRoutePrefix}/faqs`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const faqs = {
  name: 'faqs',
  path: `${localizedRoutePrefix}/faqs`,
  component: () => import('@/pages/PageFaqs.vue'),
  meta: {
    title: () => 'FAQs',
  },
}
