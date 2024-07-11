// Specification LNURLAuth https://github.com/lnurl/luds/blob/luds/03.md

import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'

export default class LNURLw {
  static createCallbackUrl(lnurlWithdrawRequest: LNURLWithdrawRequest, paymentRequest: string) {
    const parameterGlue = lnurlWithdrawRequest.callback.includes('?') ? '&' : '?'
    return `${lnurlWithdrawRequest.callback}${parameterGlue}k1=${lnurlWithdrawRequest.k1}&pr=${paymentRequest}`
  }
}
