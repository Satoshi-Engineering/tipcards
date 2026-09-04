import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteParamsGeneric,
  RouteParamsRawGeneric,
  RouteRecordName,
} from 'vue-router'

import { LOCALE_CODES, type LocaleCode } from '@shared/modules/i18n/locales'

export interface LocalizedRouteParamsRaw extends RouteParamsRawGeneric {
  lang?: LocaleCode | '',
}

export interface LocalizedRouteParams extends RouteParamsGeneric {
  lang: LocaleCode | '',
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: () => string | false,
    // deprecated
    backlink?: true | RouteRecordName | ((route: RouteLocationNormalizedLoaded) => RouteLocationRaw),
  }
}

export const localizedRoutePrefix = `/:lang(${LOCALE_CODES.join('|')})?`

export type localizedRoutePrefix = `/${LocaleCode}?`
