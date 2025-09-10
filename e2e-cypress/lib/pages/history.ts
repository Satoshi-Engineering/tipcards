import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

import { gotoPage } from './utils'

const HISTORY_PAGE_URL = new URL('/history', TIPCARDS_ORIGIN)

export const goto = () => {
  gotoPage(HISTORY_PAGE_URL)
}
