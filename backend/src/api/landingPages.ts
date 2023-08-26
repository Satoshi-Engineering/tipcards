import express from 'express'

import { ErrorCode } from '../../../src/data/Errors'
import type { LandingPage } from '../../../src/data/LandingPage'
import type { AccessTokenPayload, User } from '../../../src/data/User'

import { getUserById, getLandingPage } from '../services/database'
import { authGuardAccessToken } from '../services/jwt'

const router = express.Router()

router.get('/', authGuardAccessToken, async (_, res) => {
  const accessTokenPayload: AccessTokenPayload = res.locals.accessTokenPayload
  if (accessTokenPayload == null) {
    res.status(401).json({
      status: 'error',
      message: 'Authorization payload missing.',
      code: ErrorCode.AccessTokenMissing,
    })
    return
  }
  const userId: string = accessTokenPayload.id

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

router.get('/:landingPageId', async (req: express.Request, res: express.Response) => {
  const landingPageId: string = req.params.landingPageId

  // load landing page from database
  try {
    const landingPage = await getLandingPage(landingPageId)
    res.json({
      status: 'success',
      data: landingPage,
    })
  } catch (error: unknown) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occured. Please try again later or contact an admin.',
      code: ErrorCode.UnknownDatabaseError,
    })
  }
})

export default router
