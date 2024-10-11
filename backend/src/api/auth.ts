import { Router } from 'express'
import cookieParser from 'cookie-parser'

import { ErrorCode } from '@shared/data/Errors.js'

import { getUserById, updateUser } from '@backend/database/deprecated/queries.js'

import { authGuardRefreshToken, cycleRefreshToken } from './middleware/auth/jwt.js'

/////
// ROUTES
const router = Router()

router.post(
  '/logoutAllOtherDevices',
  cookieParser(),
  authGuardRefreshToken,
  cycleRefreshToken,
  async (req, res) => {
    try {
      const { userId } = res.locals
      const user = await getUserById(userId)
      if (user?.allowedRefreshTokens != null) {
        user.allowedRefreshTokens = user.allowedRefreshTokens
          .filter((currentRefreshTokens) => currentRefreshTokens.includes(req.cookies?.refresh_token))
        await updateUser(user)
      }
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(403).json({
        status: 'error',
        data: 'unknown database error',
      })
      return
    }
    res.json({ status: 'success' })
  },
)

export default router
