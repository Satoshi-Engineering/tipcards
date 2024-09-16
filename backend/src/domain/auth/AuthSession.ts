import type { Response, Request } from 'express'

import { ErrorCode } from '@shared/data/Errors.js'

import { getUserById, updateUser } from '@backend/database/deprecated/queries.js'

export default class AuthSession {
  private request: Request
  private response: Response

  constructor(request: Request, response: Response) {
    this.request = request
    this.response = response
  }

  public setRefreshTokenCookie(refreshToken: string) {
    this.response.cookie('refresh_token', refreshToken, {
      expires: new Date(+ new Date() + 1000 * 60 * 60 * 24 * 365),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
  }

  public async logout() {
    const refreshToken = this.request.cookies?.refresh_token
    this.response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
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
}
