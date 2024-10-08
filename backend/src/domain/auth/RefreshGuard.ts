import type { Response, Request } from 'express'

import { ErrorCode } from '@shared/data/Errors.js'

import type { User } from '@backend/database/deprecated/data/User.js'
import {
  getUserByLnurlAuthKeyOrCreateNew,
  getUserById,
  updateUser } from '@backend/database/deprecated/queries.js'
import {
  validateJwt,
  createRefreshToken,
  createAccessToken,
} from '@backend/services/jwt.js'

import { AuthErrorCodes } from './types/AuthErrorCodes.js'

export default class RefreshGuard {
  private request: Request
  private response: Response
  private userId: string | null = null

  constructor(request: Request, response: Response) {
    this.request = request
    this.response = response
  }

  public async loginWithWalletPublicKey(walletPublicKey: string): Promise<string> {
    let user: User
    try {
      // Deprecated Function
      user = await getUserByLnurlAuthKeyOrCreateNew(walletPublicKey)
    } catch (error) {
      console.error(ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey, error)
      throw new Error(`${ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey} - Unable to get or create user`)
    }

    const refreshToken = await createRefreshToken(user)
    if (user.allowedRefreshTokens == null) {
      user.allowedRefreshTokens = []
    }
    user.allowedRefreshTokens.push([refreshToken])

    try {
      // Deprecated Function
      await updateUser(user)
    } catch (error) {
      console.error(ErrorCode.UnableToUpdateUser, error)
      throw new Error(`${ErrorCode.UnableToUpdateUser} - Unable to update user authentication`)
    }

    const accessToken = await createAccessToken(user)
    this.setRefreshTokenCookie(refreshToken)
    return accessToken
  }

  async validateRefreshToken() {
    const host = this.getHostFromRequest()
    if (host == null ) {
      throw new Error(AuthErrorCodes.HOST_MISSING)
    }
    const refreshJwt = this.getRefreshTokenFromCookies()
    if (refreshJwt == null ) {
      throw new Error(AuthErrorCodes.REFRESH_TOKEN_MISSING)
    }
    const refreshJwtPayload = await validateJwt(refreshJwt, host)

    const user = await getUserById(refreshJwtPayload.id)
    if (
      user?.allowedRefreshTokens == null
      || !user.allowedRefreshTokens.find((currentRefreshTokens) => currentRefreshTokens.includes(refreshJwt))
    ) {
      this.clearRefreshTokenCookie()
      throw new Error(AuthErrorCodes.REFRESH_TOKEN_DENIED)
    }

    this.userId = refreshJwtPayload.id
  }

  public async logout() {
    const refreshToken = this.getRefreshTokenFromCookies()
    this.clearRefreshTokenCookie()
    if (refreshToken != null) {
      try {
        const parsedToken = Buffer.from(refreshToken.split('.')[1], 'base64')
        const { id: userId } = JSON.parse(parsedToken.toString())
        const user = await getUserById(userId)
        if (user?.allowedRefreshTokens != null) {
          user.allowedRefreshTokens = user.allowedRefreshTokens
            .filter((currentRefreshTokens) => !currentRefreshTokens.includes(refreshToken))
          await updateUser(user)
        }
      } catch (error) {
        throw new Error(`${ErrorCode.UnknownDatabaseError} - unknown database error`)
      }
    }
  }

  private getHostFromRequest() {
    const host = this.request.get('host')
    if (typeof host === 'string') {
      return host
    }
    return null
  }

  private getRefreshTokenFromCookies() {
    if (typeof this.request.cookies?.refresh_token === 'string') {
      return this.request.cookies?.refresh_token
    }
    return null
  }

  private setRefreshTokenCookie(refreshToken: string) {
    this.response.cookie('refresh_token', refreshToken, {
      expires: new Date(+ new Date() + 1000 * 60 * 60 * 24 * 365),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
  }

  private clearRefreshTokenCookie(): Response {
    return this.response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
  }
}
