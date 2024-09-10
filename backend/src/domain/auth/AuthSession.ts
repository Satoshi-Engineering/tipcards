import type { Response } from 'express'

export default class AuthSession {
  private response: Response

  constructor(response: Response) {
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
}
