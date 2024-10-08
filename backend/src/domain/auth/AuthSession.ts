import type { Response, Request } from 'express'

export default class AuthSession {
  private request: Request
  private response: Response

  constructor(request: Request, response: Response) {
    this.request = request
    this.response = response
  }

}
