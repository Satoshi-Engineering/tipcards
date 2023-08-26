import express from 'express'

import { ErrorCode } from '../../../src/data/Errors'
import type { ImageMeta } from '../../../src/data/Image'
import type { AccessTokenPayload, User } from '../../../src/data/User'

import { getUserById, getImageMeta } from '../services/database'
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

  const data: ImageMeta[] = []
  if (user?.availableCardsLogos != null) {
    try {
      await Promise.all(user.availableCardsLogos.map(async (imageId) => {
        const imageMeta = await getImageMeta(imageId)
        if (imageMeta != null) {
          data.push(imageMeta)
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
