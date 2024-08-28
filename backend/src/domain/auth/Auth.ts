import { exportSPKI } from 'jose'

import { AuthCreateDto } from '@shared/data/trpc/auth/AuthCreateDto.js'

import {
  getPublicKey,
} from '@backend/services/jwt.js'

export default class Auth {
  public static async publicKey() {
    const publicKey = await getPublicKey()
    const spkiPem = await exportSPKI(publicKey)
    return spkiPem
  }

  public static createLnUrlAuth(): AuthCreateDto {
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
      lnurl: '',
      hash: '',
    }
  }
}
