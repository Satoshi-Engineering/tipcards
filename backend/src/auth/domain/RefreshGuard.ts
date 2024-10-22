import type { Response, Request } from 'express'
import { randomUUID } from 'crypto'
import { errors as joseErrors } from 'jose'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'
import { PermissionsEnum } from '@shared/data/auth/User.js'
import { AccessTokenPayload } from '@shared/data/auth/index.js'
import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'

import type { User } from '@backend/database/deprecated/data/User.js'
import {
  getUserByLnurlAuthKeyOrCreateNew,
  getUserById,
  updateUser } from '@backend/database/deprecated/queries.js'
import { JWT_AUTH_ISSUER } from '@backend/constants.js'

import { ACCESS_TOKEN_EXPIRATION_TIME, REFRESH_TOKEN_EXPIRATION_TIME } from '@auth/constants.js'

type RefreshTokenParams = {
  id: string
  lnurlAuthKey: string
}

type AccessTokenParams = {
  id: string
  lnurlAuthKey: string
  permissions: PermissionsEnum[]
}

export default class RefreshGuard {
  private request: Request
  private response: Response
  private user: User | null = null
  private jwtIssuer: JwtIssuer
  private jwtAccessTokenAudience: string[] | string

  constructor(request: Request, response: Response, jwtIssuer: JwtIssuer, jwtAccessTokenAudience: string[] | string) {
    this.request = request
    this.response = response
    this.jwtIssuer = jwtIssuer
    this.jwtAccessTokenAudience = jwtAccessTokenAudience
  }

  public async loginUserWithWalletLinkingKey(walletPublicKey: string) {
    let user: User
    try {
      // Deprecated Function
      user = await getUserByLnurlAuthKeyOrCreateNew(walletPublicKey)
    } catch (error) {
      console.error(ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey, error)
      throw new ErrorWithCode('Unable to get or create user', ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey)
    }

    const refreshToken = await this.createRefreshToken(user)
    if (user.allowedRefreshTokens == null) {
      user.allowedRefreshTokens = []
    }
    user.allowedRefreshTokens.push([refreshToken])

    try {
      // Deprecated Function
      await updateUser(user)
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToUpdateUser)
    }

    this.setRefreshTokenCookie(refreshToken)
    this.user = user
  }

  async authenticateUserViaRefreshToken() {
    const refreshJwt = this.getRefreshTokenFromRequestCookies()
    if (refreshJwt == null) {
      throw new ErrorWithCode('Refresh token missing in request cookie', ErrorCode.RefreshTokenMissing)
    }
    const host = this.getHostFromRequest()
    if (host == null ) {
      throw new ErrorWithCode('Host missing in Request', ErrorCode.AuthHostMissingInRequest)
    }

    const refreshJwtPayload = await this.validateRefreshTokenAndGetPayload(refreshJwt, host)

    let user
    try {
      user = await getUserById(refreshJwtPayload.id)
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
    }
    if (
      user?.allowedRefreshTokens == null
      || !user.allowedRefreshTokens.find((currentRefreshTokens) => currentRefreshTokens.includes(refreshJwt))
    ) {
      this.clearRefreshTokenCookie()
      throw new ErrorWithCode('Refresh token not found in allowed refresh tokens', ErrorCode.RefreshTokenDenied)
    }

    this.user = user
  }

  async cycleRefreshToken() {
    if (this.user == null) {
      throw new ErrorWithCode('User not loaded', ErrorCode.AuthUserNotLoaded)
    }
    const previousRefreshToken = this.getRefreshTokenFromRequestCookies()
    if (previousRefreshToken == null ) {
      throw new ErrorWithCode('Refresh token missing in request cookie', ErrorCode.RefreshTokenMissing)
    }
    const newRefreshToken = await this.createRefreshToken(this.user)
    if (this.user.allowedRefreshTokens == null) {
      this.user.allowedRefreshTokens = []
    }
    this.user.allowedRefreshTokens = this.user.allowedRefreshTokens.map((currentRefreshTokens) => {
      if (!currentRefreshTokens.includes(previousRefreshToken)) {
        return currentRefreshTokens
      }
      return [newRefreshToken, previousRefreshToken]
    })
    try {
      // Deprecated Function
      await updateUser(this.user)
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToUpdateUser)
    }
    this.setRefreshTokenCookie(newRefreshToken)
  }

  async createAccessTokenForUser() {
    if (this.user == null) {
      throw new ErrorWithCode('User not loaded', ErrorCode.AuthUserNotLoaded)
    }
    return this.createAccessToken(this.user)
  }

  public async logout() {
    const refreshToken = this.getRefreshTokenFromRequestCookies()
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
        throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
      }
    }
  }

  public async logoutAllOtherDevices() {
    if (this.user == null) {
      throw new ErrorWithCode('User not loaded', ErrorCode.AuthUserNotLoaded)
    }
    const refreshToken = this.getRefreshTokenFromRequestCookies()
    if (refreshToken == null ) {
      throw new ErrorWithCode('Refresh token missing in request cookie', ErrorCode.RefreshTokenMissing)
    }
    if (this.user?.allowedRefreshTokens != null) {
      this.user.allowedRefreshTokens = this.user.allowedRefreshTokens
        .filter((currentRefreshTokens) => currentRefreshTokens.includes(refreshToken))
      try {
        // Deprecated Function
        await updateUser(this.user)
      } catch (error) {
        throw new ErrorWithCode(error, ErrorCode.UnableToUpdateUser)
      }
    }
  }

  private async validateRefreshTokenAndGetPayload(refreshJwt: string, host: string) {
    try {
      const payload = await this.jwtIssuer.validate(refreshJwt, host)
      return AccessTokenPayload.parse(payload)
    } catch (error) {
      if (error instanceof joseErrors.JWTExpired) {
        throw new ErrorWithCode('Refresh token expired', ErrorCode.RefreshTokenExpired)
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

  private async createRefreshToken({ id, lnurlAuthKey }: RefreshTokenParams) {
    const nonce = randomUUID()
    try {
      return  this.jwtIssuer.createJwt(
        JWT_AUTH_ISSUER,
        REFRESH_TOKEN_EXPIRATION_TIME,
        { id, lnurlAuthKey, nonce },
      )
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.AuthJwtHanderRefreshTokenCreationError)
    }
  }

  private createAccessToken({ id, lnurlAuthKey, permissions }: AccessTokenParams) {
    const nonce = randomUUID()
    try {
      return  this.jwtIssuer.createJwt(
        this.jwtAccessTokenAudience,
        ACCESS_TOKEN_EXPIRATION_TIME,
        { id, lnurlAuthKey, permissions, nonce },
      )
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.AuthJwtHanderAccessTokenCreationError)
    }
  }
}
