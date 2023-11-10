import { Router } from 'express'

import { LandingPage as LandingPageApi } from '@shared/data/api/LandingPage'
import type { AccessTokenPayload } from '@shared/data/auth'
import { ErrorCode } from '@shared/data/Errors'

import type { LandingPage } from '@backend/database/redis/data/LandingPage'
import type { User } from '@backend/database/redis/data/User'
import { getUserById, getLandingPage } from '@backend/services/database'
import { authGuardAccessToken } from '@backend/services/jwt'

const router = Router()

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

  const landingPages: LandingPage[] = []
  if (user?.availableLandingPages != null) {
    try {
      await Promise.all(user.availableLandingPages.map(async (landingPageId) => {
        const landingPage = await getLandingPage(landingPageId)
        if (landingPage != null) {
          landingPages.push(landingPage)
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
    data: landingPages.map((landingPage) => LandingPageApi.parse(landingPage)),
  })
})

router.get('/:landingPageId', async (req, res) => {
  const landingPageId: string = req.params.landingPageId

  // load landing page from database
  try {
    const landingPage = await getLandingPage(landingPageId)
    res.json({
      status: 'success',
      data: LandingPageApi.parse(landingPage),
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
