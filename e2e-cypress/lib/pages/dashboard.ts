import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

import { gotoPage } from './utils'

const DASHBOARD_PAGE_URL = new URL('/dashboard', TIPCARDS_ORIGIN)

export const goto = () => {
  gotoPage(DASHBOARD_PAGE_URL)
}
