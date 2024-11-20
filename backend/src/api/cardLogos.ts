import { Router } from 'express'

import { Image as ImageApi } from '@shared/data/api/Image.js'
import type { AccessTokenPayload } from '@shared/data/auth/index.js'
import { ErrorCode } from '@shared/data/Errors.js'

import type { User } from '@backend/database/deprecated/data/User.js'
import type { Image as ImageMeta } from '@backend/database/deprecated/data/Image.js'
import { getUserById, getImageMeta } from '@backend/database/deprecated/queries.js'

import { authGuardAccessToken } from './middleware/auth/jwt.js'

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
  const userId: string = accessTokenPayload.userId

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

  const images: ImageMeta[] = []
  if (user?.availableCardsLogos != null) {
    try {
      await Promise.all(user.availableCardsLogos.map(async (imageId) => {
        const imageMeta = await getImageMeta(imageId)
        if (imageMeta != null) {
          images.push(imageMeta)
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
    data: images.map((image) => ImageApi.parse(image)),
  })
})

export default router
