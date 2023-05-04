import express from 'express'

import { ErrorCode } from '../../../src/data/Errors'
import type { LandingPage } from '../../../src/data/LandingPage'
import type { User } from '../../../src/data/User'

import { getUserById, getLandingPage } from '../services/database'
import { authGuard } from '../services/jwt'

const router = express.Router()

router.get('/', authGuard, async (req: express.Request, res: express.Response) => {
  if (typeof res.locals.jwtPayload?.id !== 'string') {
    res.status(400).json({
      status: 'error',
      message: 'Invalid input.',
      code: ErrorCode.InvalidInput,
    })
    return
  }
  const userId: string = res.locals.jwtPayload.id

  // load user from database
  let user: User | null = null
  try {
    user = await getUserById(userId)
  } catch (error: unknown) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occured. Please try again later or contact an admin.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }

  const data: LandingPage[] = []
  if (user?.availableLandingPages != null) {
    try {
      await Promise.all(user.availableLandingPages.map(async (landingPageId) => {
        const landingPage = await getLandingPage(landingPageId)
        if (landingPage != null) {
          data.push(landingPage)
        }
      }))
    } catch (error: unknown) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(500).json({
        status: 'error',
        message: 'An unexpected error occured. Please try again later or contact an admin.',
        code: ErrorCode.UnknownDatabaseError,
      })
      return
    }
  }

  res.json({
    status: 'success',
    data,
  })
})

export default router
