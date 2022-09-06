// Exclude TRACE and TRACK methods to avoid XST attacks.
import type { NextFunction, Request, Response } from 'express-serve-static-core'

const ALLOWED_METHODS = [
  'OPTIONS',
  'HEAD',
  'CONNECT',
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
]

const xstAttackMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!ALLOWED_METHODS.includes(req.method)) {
    res.status(405).send(`${req.method} not allowed 🤔`).end()
    return
  }

  next()
}

export default () => {
  return xstAttackMiddleware
}
