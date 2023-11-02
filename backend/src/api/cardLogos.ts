import express from 'express'

import type { AccessTokenPayload } from '@shared/data/api/AccessTokenPayload'
import type { Image as ImageMeta } from '@shared/data/redis/Image'
import type { User } from '@shared/data/redis/User'
import { ErrorCode } from '@shared/data/Errors'

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
