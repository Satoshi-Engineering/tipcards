import express from 'express'

import { ErrorCode } from '../../../src/data/Errors'
import type { ImageMeta } from '../../../src/data/Image'
import type { User } from '../../../src/data/User'

import { getUserById, getImageMeta } from '../services/database'
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

  // load set from database
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
