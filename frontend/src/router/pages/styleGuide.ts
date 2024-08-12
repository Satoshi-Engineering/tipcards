import type { RouteRecordInfo } from 'vue-router'

import {
  localizedRoutePrefix,
  type LocalizedRouteParamsRaw,
  type LocalizedRouteParams,
  type AppRouteMeta,
} from '@/router/utils'

export interface RouteStyleGuide extends RouteRecordInfo<
  'style-guide',
  `${localizedRoutePrefix}/style-guide`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
> {}

export const styleGuide = {
  name: 'style-guide',
  path: `${localizedRoutePrefix}/style-guide`,
  component: () => import('@/pages/styleGuide/PageStyleGuide.vue'),
  meta: {
    title: () => 'Style Guide',
  },
}

export interface RouteStyleGuideTypographyAndButtons extends RouteRecordInfo<
  'style-guide/typography-and-buttons',
  `${localizedRoutePrefix}/style-guide/typography-and-buttons`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
> {}

export const styleGuideTypographyAndButtons = {
  name: 'style-guide/typography-and-buttons',
  path: `${localizedRoutePrefix}/style-guide/typography-and-buttons`,
  component: () => import('@/pages/styleGuide/PageTypographyAndButtons.vue'),
  meta: {
    title: () => 'Tyography And Buttons',
  },
}

export interface RouteStyleGuideIcons extends RouteRecordInfo<
  'style-guide/icons',
  `${localizedRoutePrefix}/style-guide/icons`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
> {}

export const styleGuideIcons = {
  name: 'style-guide/icons',
  path: `${localizedRoutePrefix}/style-guide/icons`,
  component: () => import('@/pages/styleGuide/PageIcons.vue'),
  meta: {
    title: () => 'Icons',
  },
}

export interface RouteStyleGuideComponents extends RouteRecordInfo<
  'style-guide/components',
  `${localizedRoutePrefix}/style-guide/components`,
  LocalizedRouteParamsRaw,
  LocalizedRouteParams,
  AppRouteMeta
> {}

export const styleGuideComponents = {
  name: 'style-guide/components',
  path: `${localizedRoutePrefix}/style-guide/components`,
  component: () => import('@/pages/styleGuide/PageComponents.vue'),
  meta: {
    title: () => 'Components',
  },
}
