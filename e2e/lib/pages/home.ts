import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'
import { gotoPage } from './utils'

const HOME_PAGE_URL = new URL('/', TIPCARDS_ORIGIN)

export const goto = () => {
  gotoPage(HOME_PAGE_URL)
}
