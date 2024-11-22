import { randomUUID } from 'crypto'
import type { Response } from 'express'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'
import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'
import { AccessTokenPayload } from '@shared/data/auth/index.js'

import User from '@backend/domain/User.js'
import { JWT_AUTH_ISSUER } from '@backend/constants.js'

import AllowedSession from '@auth/domain/AllowedSession.js'
import { ACCESS_TOKEN_EXPIRATION_TIME, REFRESH_TOKEN_EXPIRATION_TIME } from '@auth/constants.js'

export default class AuthenticatedUser {
  constructor({
    user,
    allowedSession,
    response,
    jwtIssuer,
    jwtAccessTokenAudience,
  }: {
    user: User,
    allowedSession: AllowedSession,
    response: Response,
    jwtIssuer: JwtIssuer,
    jwtAccessTokenAudience: string[] | string,
  }) {
    this.user = user
    this.allowedSession = allowedSession
    this.response = response
    this.jwtIssuer = jwtIssuer
    this.jwtAccessTokenAudience = jwtAccessTokenAudience
  }

  async setNewRefreshTokenCookie() {
    const refreshToken = await this.createRefreshToken()
    this.response.cookie('refresh_token', refreshToken, {
      expires: new Date(+ new Date() + 1000 * 60 * 60 * 24 * 365),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
  }

  /**
   * @throws ErrorWithCode(error, ErrorCode.AuthJwtHanderAccessTokenCreationError)
   */
  async createAccessToken() {
    const nonce = randomUUID()
    const payload: AccessTokenPayload = {
      userId: this.user.id,
      permissions: this.user.permissions,
      nonce,
    }
    try {
      return this.jwtIssuer.createJwt(
        this.jwtAccessTokenAudience,
        ACCESS_TOKEN_EXPIRATION_TIME,
        payload,
      )
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.AuthJwtHanderAccessTokenCreationError)
    }
  }

  async logout() {
    this.clearRefreshTokenCookie()
    await this.allowedSession.delete()
  }

  async logoutAllOtherDevices() {
    await AllowedSession.deleteAllSessionsForUserExecptOne(this.user.id, this.allowedSession.sessionId)
  }

  get userId() {
    return this.user.id
  }

  private user: User
  private allowedSession: AllowedSession
  private response: Response
  private jwtIssuer: JwtIssuer
  private jwtAccessTokenAudience: string[] | string

  private async createRefreshToken() {
    const nonce = randomUUID()
    try {
      return this.jwtIssuer.createJwt(
        JWT_AUTH_ISSUER,
        REFRESH_TOKEN_EXPIRATION_TIME,
        {
          userId: this.user.id,
          sessionId: this.allowedSession.sessionId,
          nonce,
        },
      )
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.AuthJwtHanderRefreshTokenCreationError)
    }
  }

  private clearRefreshTokenCookie(): Response {
    return this.response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
  }
}
