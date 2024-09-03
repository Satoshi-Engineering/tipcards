import { exportSPKI } from 'jose'

import { LnurlAuthLoginDto } from '@shared/data/trpc/auth/LnurlAuthLoginDto.js'

import {
  getPublicKey,
} from '@backend/services/jwt.js'

export default class Auth {
  public static async getPublicKey() {
    const publicKey = await getPublicKey()
    const spkiPem = await exportSPKI(publicKey)
    return spkiPem
  }

  public static createLnUrlAuth(): LnurlAuthLoginDto {
    /*
    const result = await lnurlServer.generateNewUrl('login')
    const secret = Buffer.from(result.secret, 'hex')
    const hash = createHash('sha256').update(secret).digest('hex')
    delete loggedIn[hash]
    res.json({
      status: 'success',
      data: {
        encoded: result.encoded,
        hash,
      },
    })
      -*/
    return {
      lnurlAuth: '',
      hash: '',
    }
  }
}
