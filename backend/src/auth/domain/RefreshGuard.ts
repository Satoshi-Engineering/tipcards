import type { Response, Request } from 'express'
import { errors as joseErrors } from 'jose'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'
import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'

import User from '@backend/domain/User.js'

import {
  getAuthenticatedUserIdFromAllowedRefreshTokenFormat,
} from '@auth/domain/allowedRefreshTokensHelperFunctions.js'
import AllowedSession from '@auth/domain/AllowedSession.js'
import AuthenticatedUser from '@auth/domain/AuthenticatedUser.js'
import { RefreshTokenPayload } from '@auth/types/RefreshTokenPayload.js'

export default class RefreshGuard {
  constructor(request: Request, response: Response, jwtIssuer: JwtIssuer, jwtAccessTokenAudience: string[] | string) {
    this.request = request
    this.response = response
    this.jwtIssuer = jwtIssuer
    this.jwtAccessTokenAudience = jwtAccessTokenAudience
  }

  async loginUserWithWalletLinkingKey(walletPublicKey: string) {
    let user = null
    try {
      user = await User.fromLnurlAuthKey(walletPublicKey)
      if (user == null) {
        user = User.newUserFromWalletLinkingKey(walletPublicKey)
        await user.insert()
      }
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey)
    }

    const allowedSession = AllowedSession.createNewForUserId(user.id)
    await allowedSession.insert()

    return this.createAuthenticatedUser(user, allowedSession)
  }

  async authenticateUserViaRefreshToken() {
    const refreshToken = this.getRefreshTokenFromRequestCookies()
    if (refreshToken == null) {
      throw new ErrorWithCode('Refresh token missing in request cookie', ErrorCode.RefreshTokenMissing)
    }
    const host = this.getHostFromRequest()
    if (host == null) {
      throw new ErrorWithCode('Host missing in Request', ErrorCode.AuthHostMissingInRequest)
    }

    const jwtPayload = await this.validateRefreshTokenAndGetPayload(refreshToken, host)
    const jwtParseResult = RefreshTokenPayload.safeParse(jwtPayload)

    let userId
    let allowedSession

    if (jwtParseResult.success) {
      const refreshTokenPayload = jwtParseResult.data
      userId = refreshTokenPayload.userId
      allowedSession = await AllowedSession.fromSessionId(refreshTokenPayload.sessionId)
      if (allowedSession == null) {
        throw new ErrorWithCode('SessionId not found', ErrorCode.RefreshTokenDenied)
      }
    } else {
      userId = await getAuthenticatedUserIdFromAllowedRefreshTokenFormat(jwtPayload, refreshToken)
      allowedSession = AllowedSession.createNewForUserId(userId)
      await allowedSession.insert()
    }

    const user = await User.fromId(userId)
    if (user == null) {
      throw new ErrorWithCode('User with id ${userId} not found in Database', ErrorCode.RefreshTokenDenied)
    }
    return this.createAuthenticatedUser(user, allowedSession)
  }

  getRefreshTokenFromRequestCookies() {
    const cookies = this.getRequestCookies()
    return cookies['refresh_token'] || null
  }

  clearRefreshTokenCookie(): Response {
    return this.response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
  }

  private request: Request
  private response: Response
  private jwtIssuer: JwtIssuer
  private jwtAccessTokenAudience: string[] | string

  private async validateRefreshTokenAndGetPayload(refreshJwt: string, host: string) {
    try {
      return await this.jwtIssuer.validate(refreshJwt, host)
    } catch (error) {
      if (error instanceof joseErrors.JWTExpired) {
        throw new ErrorWithCode(error, ErrorCode.RefreshTokenExpired)
      }
      if (error instanceof joseErrors.JOSEError) {
        throw new ErrorWithCode(error, ErrorCode.RefreshTokenInvalid)
      }
      throw error
    }
  }

  private getHostFromRequest() {
    const host = this.request.get('host')
    if (typeof host === 'string') {
      return host
    }
    return null
  }

  private getRequestCookies() {
    const cookies: { [key: string]: string } = {}
    if (!this.request.headers || !this.request.headers.cookie) {
      return cookies
    }

    if (typeof this.request.headers.cookie !== 'string') {
      return cookies
    }

    if (this.request.headers.cookie.length <= 0) {
      return cookies
    }

    const cookiePairs = this.request.headers.cookie.split('; ')
    cookiePairs.forEach(cookie => {
      const [key, value] = cookie.split('=')
      cookies[key] = decodeURIComponent(value)
    })

    return cookies
  }

  private createAuthenticatedUser(user: User, allowedSession: AllowedSession) {
    return new AuthenticatedUser({
      user,
      allowedSession,
      response: this.response,
      jwtIssuer: this.jwtIssuer,
      jwtAccessTokenAudience: this.jwtAccessTokenAudience,
    })
  }
}
