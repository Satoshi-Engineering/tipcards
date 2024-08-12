import type {
  RouteMeta,
  RouteLocationNormalizedLoaded,
  RouteParamsGeneric,
  RouteParamsRawGeneric,
} from 'vue-router'

import { LOCALES, type LOCALE } from '@shared/modules/i18n/locales'

export interface LocalizedRouteParamsRaw extends RouteParamsRawGeneric {
  lang?: LOCALE,
}

export interface LocalizedRouteParams extends RouteParamsGeneric {
  lang: LOCALE,
}

export interface AppRouteMeta extends RouteMeta {
  title: () => string | false,
  // deprecated
  backlink: boolean | string | ((route: RouteLocationNormalizedLoaded) => RouteLocationNormalizedLoaded),
}

export const localizedRoutePrefix = `/:lang(${Object.keys(LOCALES).join('|')})?`

export type localizedRoutePrefix = `/${LOCALE}?`
