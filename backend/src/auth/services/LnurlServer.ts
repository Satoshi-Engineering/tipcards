import lnurl from 'lnurl'

import {
  LNURL_PORT, LNURL_SERVICE_ORIGIN,
  LNBITS_ORIGIN, LNBITS_ADMIN_KEY,
} from '@backend/constants.js'

export default class LnurlServer {
  static init() {
    if (LnurlServer.singleton != null) {
      throw new Error('LnurlServer already started!')
    }

    LnurlServer.singleton = new LnurlServer()
  }

  static getServer(): lnurl.LnurlServer {
    if (LnurlServer.singleton == null) {
      throw new Error('LnurlServer getServer called before init!')
    }

    return LnurlServer.singleton.lnurlServer
  }

  private static singleton: LnurlServer
  private lnurlServer: lnurl.LnurlServer

  private constructor() {
    this.lnurlServer = lnurl.createServer({
      host: '0.0.0.0',
      port: LNURL_PORT,
      url: LNURL_SERVICE_ORIGIN,
      lightning: {
        backend: 'lnbits',
        config: {
          baseUrl: LNBITS_ORIGIN,
          adminKey: LNBITS_ADMIN_KEY,
        },
      },
    })
  }
}
