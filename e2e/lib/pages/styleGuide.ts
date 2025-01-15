import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

import { gotoPage } from './utils'

export const goto = () => {
  gotoPage(new URL('/style-guide', TIPCARDS_ORIGIN))
}

export const gotoComponents = () => {
  gotoPage(new URL('/style-guide/components', TIPCARDS_ORIGIN))
}
