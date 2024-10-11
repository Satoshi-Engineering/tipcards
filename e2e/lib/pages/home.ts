import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'
import { gotoPage } from './utils'

const LOGIN_PAGE_URL = new URL('/', TIPCARDS_ORIGIN)

export const goto = () => {
  gotoPage(LOGIN_PAGE_URL)
}
