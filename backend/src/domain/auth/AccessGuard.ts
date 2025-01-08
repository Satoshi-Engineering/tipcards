import { type Request } from 'express'
import { errors, type JWTPayload } from 'jose'

import JwtValidator from '@shared/modules/Jwt/JwtValidator.js'
import { AccessTokenPayload } from '@shared/data/auth/index.js'
import { PermissionsEnum } from '@shared/data/auth/User.js'

import User from '../User.js'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

export default class AccessGuard {
  private request: Request
  private jwtValidator: JwtValidator

  constructor({
    request,
    jwtValidator,
  }: {
    request: Request,
    jwtValidator: JwtValidator,
  }) {
    this.request = request
    this.jwtValidator = jwtValidator
  }

  async authenticateUserViaAccessToken({ requiredPermissions = [] }: { requiredPermissions?: PermissionsEnum[] } = {}): Promise<User> {
    const host = this.getHost()
    const authorizationHeader = this.getAuthorizationHeader()
    const payload = await this.validateJwt({
      host,
      jwt: authorizationHeader,
    })
    const accessToken = this.parseAccessTokenPayload(payload)
    this.validatePermissions({
      accessToken,
      requiredPermissions,
    })
    const authenticatedUser = await User.fromId(accessToken.userId)
    if (!authenticatedUser) {
      throw new ErrorWithCode('User not found.', ErrorCode.UnknownDatabaseError)
    }

    return authenticatedUser
  }

  private getHost() {
    const host = this.request.get('host')
    if (!(typeof host === 'string')) {
      throw new ErrorWithCode('Host missing in Request', ErrorCode.AuthHostMissingInRequest)
    }
    return host
  }

  private getAuthorizationHeader() {
    const authorization = this.request.headers.authorization
    if (!(typeof authorization === 'string')) {
      throw new ErrorWithCode(`Authorization in header missing or not a string (${typeof authorization})`, ErrorCode.AccessTokenMissing)
    }
    return authorization
  }

  private async validateJwt({
    jwt,
    host,
  }: {
    jwt: string,
    host: string,
  }) {
    try {
      return await this.jwtValidator.validate(jwt, host)
    } catch (error) {
      if (error instanceof errors.JWTExpired) {
        throw new ErrorWithCode(error, ErrorCode.AccessTokenExpired)
      }
      throw new ErrorWithCode(error, ErrorCode.AccessTokenInvalid)
    }
  }

  private parseAccessTokenPayload(payload: JWTPayload) {
    try {
      return AccessTokenPayload.parse(payload)
    } catch {
      throw new ErrorWithCode('JWT payload parsing failed.', ErrorCode.ZodErrorParsingAccessTokenPayload)
    }
  }

  private validatePermissions({
    accessToken,
    requiredPermissions,
  }: {
    accessToken: AccessTokenPayload,
    requiredPermissions: PermissionsEnum[]
  }) {
    requiredPermissions.forEach((permission) => {
      if (!accessToken.permissions.includes(permission)) {
        throw new ErrorWithCode( `Missing permissions: ${permission}`, ErrorCode.PermissionDenied)
      }
    })
  }
}
