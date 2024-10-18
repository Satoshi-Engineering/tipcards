import type { RouteRecordInfo } from 'vue-router'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export type RouteStyleGuide = RouteRecordInfo<
  'style-guide',
  `${localizedRoutePrefix}/style-guide`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const styleGuide = {
  name: 'style-guide',
  path: `${localizedRoutePrefix}/style-guide`,
  component: () => import('@/pages/styleGuide/PageStyleGuide.vue'),
  meta: {
    title: () => 'Style Guide',
  },
}

export type RouteStyleGuideComponents = RouteRecordInfo<
  'style-guide/components',
  `${localizedRoutePrefix}/style-guide/components`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const styleGuideComponents = {
  name: 'style-guide/components',
  path: `${localizedRoutePrefix}/style-guide/components`,
  component: () => import('@/pages/styleGuide/PageComponents.vue'),
  meta: {
    title: () => 'Components',
  },
}

export type RouteStyleGuideForms = RouteRecordInfo<
  'style-guide/forms',
  `${localizedRoutePrefix}/style-guide/forms`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const styleGuideForms = {
  name: 'style-guide/forms',
  path: `${localizedRoutePrefix}/style-guide/forms`,
  component: () => import('@/pages/styleGuide/PageForms.vue'),
  meta: {
    title: () => 'Forms',
  },
}

export type RouteStyleGuideIcons = RouteRecordInfo<
  'style-guide/icons',
  `${localizedRoutePrefix}/style-guide/icons`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const styleGuideIcons = {
  name: 'style-guide/icons',
  path: `${localizedRoutePrefix}/style-guide/icons`,
  component: () => import('@/pages/styleGuide/PageIcons.vue'),
  meta: {
    title: () => 'Icons',
  },
}

export type RouteStyleGuideTypographyAndButtons = RouteRecordInfo<
  'style-guide/typography-and-buttons',
  `${localizedRoutePrefix}/style-guide/typography-and-buttons`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
>

export const styleGuideTypographyAndButtons = {
  name: 'style-guide/typography-and-buttons',
  path: `${localizedRoutePrefix}/style-guide/typography-and-buttons`,
  component: () => import('@/pages/styleGuide/PageTypographyAndButtons.vue'),
  meta: {
    title: () => 'Tyography And Buttons',
  },
}
