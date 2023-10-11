import type { Request, Response, NextFunction } from 'express'

import type { AccessTokenPayload } from '../../../src/data/api/AccessTokenPayload'
import { ErrorCode } from '../../../src/data/Errors'
import type { CheckAccessTokenPermissions } from '../../../src/modules/checkAccessTokenPermissions'

export const authGuardPermissions = (callable: CheckAccessTokenPermissions) =>
  async (_: Request, res: Response, next: NextFunction) => {
    const accessTokenPayload: AccessTokenPayload = res.locals.accessTokenPayload
    if (accessTokenPayload == null) {
      res.status(401).json({
        status: 'error',
        message: 'Authorization payload missing.',
        code: ErrorCode.AccessTokenMissing,
      })
      return
    }

    if (!callable(accessTokenPayload)) {
      res.status(403).json({
        status: 'error',
        message: 'Permissions missing.',
        code: ErrorCode.PermissionsMissing,
      })
      return
    }

    next()
  }
