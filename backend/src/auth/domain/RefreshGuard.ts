import type { Response, Request } from 'express'
import { randomUUID } from 'crypto'
import { errors as joseErrors, type JWTPayload } from 'jose'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'
import { PermissionsEnum } from '@shared/data/auth/User.js'
import { AccessTokenPayload } from '@shared/data/auth/index.js'
import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'

import { JWT_AUTH_ISSUER } from '@backend/constants.js'
import User from '@backend/domain/User.js'
import AllowedSession from '@backend/domain/AllowedSession.js'

import { ACCESS_TOKEN_EXPIRATION_TIME, REFRESH_TOKEN_EXPIRATION_TIME } from '@auth/constants.js'
import { RefreshTokenPayload } from '@auth/types/RefreshTokenPayload.js'
import { deleteAllRefreshTokensInDatabase, deleteRefreshTokenInDatabase, parseJWTPayload, validateRefeshTokenInDatabase } from './allowedRefreshTokensHelperFunctions.js'

type RefreshTokenParams = Omit<RefreshTokenPayload, 'nonce'>

type AccessTokenParams = {
  id: string
  lnurlAuthKey: string
  permissions: PermissionsEnum[]
}

export default class RefreshGuard {
  private request: Request
  private response: Response
  private userId: string | null = null
  private sessionId: string | null = null
  private jwtIssuer: JwtIssuer
  private jwtAccessTokenAudience: string[] | string

  constructor(request: Request, response: Response, jwtIssuer: JwtIssuer, jwtAccessTokenAudience: string[] | string) {
    this.request = request
    this.response = response
    this.jwtIssuer = jwtIssuer
    this.jwtAccessTokenAudience = jwtAccessTokenAudience
  }

  public async loginUserWithWalletLinkingKey(walletPublicKey: string) {
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

    const refreshToken = await this.createRefreshToken({
      userId: user.id,
      sessionId: allowedSession.sessionId,
    })

    this.setRefreshTokenCookie(refreshToken)
    this.userId = user.id
    this.sessionId = allowedSession.sessionId
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
    // thorws  joseErrors.JWTExpired
    // TODO: remove jwtExpiredError.payload.sessionId from database

    const jwtParseResult = RefreshTokenPayload.safeParse(jwtPayload)

    // If parsing fails, check if its the deprecated format
    if (!jwtParseResult.success) {
      try {
        const userId = await this.getAuthenticatedUserIdFromDeprecatedRefreshTokenFormat(jwtPayload, refreshToken)
        const allowedSession = AllowedSession.createNewForUserId(userId)
        await allowedSession.insert()
        this.userId = userId
        this.sessionId = allowedSession.sessionId
        return
      } catch(error) {
        this.clearRefreshTokenCookie()
        throw error
      }
    }

    const refreshTokenPayload = jwtParseResult.data
    const allowedSession = AllowedSession.fromSessionId(refreshTokenPayload.sessionId)
    if (allowedSession == null) {
      throw new ErrorWithCode('SessionId not found', ErrorCode.RefreshTokenInvalid)
    }

    this.sessionId = refreshTokenPayload.sessionId
    this.userId = refreshTokenPayload.userId
  }

  async cycleRefreshToken() {
    if (this.userId == null) {
      throw new ErrorWithCode('UserId not set', ErrorCode.AuthUserNotAuthenticated)
    }
    if (this.sessionId == null) {
      throw new ErrorWithCode('SessionId not set', ErrorCode.AuthUserNotAuthenticated)
    }

    const newRefreshToken = await this.createRefreshToken({
      userId: this.userId,
      sessionId: this.sessionId,
    })
    this.setRefreshTokenCookie(newRefreshToken)
  }

  async createAccessTokenForUser() {
    if (this.userId == null) {
      throw new ErrorWithCode('UserId not set', ErrorCode.AuthUserNotAuthenticated)
    }
    if (this.sessionId == null) {
      throw new ErrorWithCode('SessionId not set', ErrorCode.AuthUserNotAuthenticated)
    }
    const user = await User.fromId(this.userId)
    if (user == null) {
      throw new ErrorWithCode('User is authenticated, but not found in database', ErrorCode.UnknownDatabaseError)
    }
    return this.createAccessToken(user)
  }

  public async logout() {
    this.clearRefreshTokenCookie()

    try {
      this.authenticateUserViaRefreshToken()
    } catch {
      // If user can not be authenticated, stop
      return
    }

    if (this.sessionId != null) {
      const allowedSession = await AllowedSession.fromSessionId(this.sessionId)
      await allowedSession?.delete()
    }

    await deleteRefreshTokenInDatabase(this.getRefreshTokenFromRequestCookies())
  }

  public async logoutAllOtherDevices() {
    if (this.userId == null) {
      throw new ErrorWithCode('UserId not set', ErrorCode.AuthUserNotAuthenticated)
    }
    if (this.sessionId == null) {
      throw new ErrorWithCode('SessionId not set', ErrorCode.AuthUserNotAuthenticated)
    }
    const refreshToken = this.getRefreshTokenFromRequestCookies()
    if (refreshToken == null ) {
      throw new ErrorWithCode('Refresh token missing in request cookie', ErrorCode.RefreshTokenMissing)
    }
    await deleteAllRefreshTokensInDatabase(this.userId)
    await AllowedSession.deleteAllSessionsForUserExecptOne(this.userId, this.sessionId)
  }

  private async validateRefreshTokenAndGetPayload(refreshJwt: string, host: string) {
    try {
      return await this.jwtIssuer.validate(refreshJwt, host)
    } catch (error) {
      if (error instanceof joseErrors.JWTExpired) {
        throw new ErrorWithCode(error, ErrorCode.RefreshTokenExpired)
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

  private getRefreshTokenFromRequestCookies() {
    const cookies = this.getRequestCookies()
    return cookies['refresh_token'] || null
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

  private async createRefreshToken({ userId, sessionId }: RefreshTokenParams) {
    const nonce = randomUUID()
    try {
      return this.jwtIssuer.createJwt(
        JWT_AUTH_ISSUER,
        REFRESH_TOKEN_EXPIRATION_TIME,
        { userId, sessionId, nonce },
      )
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.AuthJwtHanderRefreshTokenCreationError)
    }
  }

  private createAccessToken({ id, lnurlAuthKey, permissions }: AccessTokenParams) {
    const nonce = randomUUID()
    try {
      return this.jwtIssuer.createJwt(
        this.jwtAccessTokenAudience,
        ACCESS_TOKEN_EXPIRATION_TIME,
        { id, lnurlAuthKey, permissions, nonce },
      )
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.AuthJwtHanderAccessTokenCreationError)
    }
  }

  private async getAuthenticatedUserIdFromDeprecatedRefreshTokenFormat(jwtPayload: JWTPayload, refreshToken: string) {
    const refreshTokenPayloadDeprecated = parseJWTPayload(jwtPayload)
    await validateRefeshTokenInDatabase(refreshTokenPayloadDeprecated.id, refreshToken)

    return refreshTokenPayloadDeprecated.id
  }
}
