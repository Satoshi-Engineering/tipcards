import type {
  RouteMeta,
  RouteLocationNormalizedLoaded,
  RouteParamsGeneric,
  RouteParamsRawGeneric,
} from 'vue-router'

import { LOCALE_CODES, type LocaleCode } from '@shared/modules/i18n/locales'

export interface LocalizedRouteParamsRaw extends RouteParamsRawGeneric {
  lang?: LocaleCode | '',
}

export interface LocalizedRouteParams extends RouteParamsGeneric {
  lang: LocaleCode | '',
}

export interface AppRouteMeta extends RouteMeta {
  title: () => string | false,
  // deprecated
  backlink: boolean | string | ((route: RouteLocationNormalizedLoaded) => RouteLocationNormalizedLoaded),
}

export const localizedRoutePrefix = `/:lang(${LOCALE_CODES.join('|')})?`

export type localizedRoutePrefix = `/${LocaleCode}?`
