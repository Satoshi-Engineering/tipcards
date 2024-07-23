import { type Request, type Response, type NextFunction, Router } from 'express'

import { ErrorCode } from '@shared/data/Errors.js'

import { Type as ImageType, type Image as ImageMeta } from '@backend/database/deprecated/data/Image.js'
import { getImageAsString, getImageMeta } from '@backend/database/deprecated/queries.js'
import { CROSS_ORIGIN_RESOURCES } from '@backend/constants.js'

const router = Router()

export const crossOriginResources = async (_: Request, res: Response, next: NextFunction) => {
  if (CROSS_ORIGIN_RESOURCES) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  }
  next()
}

router.get('/cardLogos/:image', crossOriginResources, async (req, res) => {
  const imageName = req.params.image
  const imageId = imageName.split('.')[0]

  // load set from database
  let imageMeta: ImageMeta | null = null
  let image: string | null = null
  try {
    imageMeta = await getImageMeta(imageId)
    image = await getImageAsString(imageId)
  } catch (error: unknown) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occured. Please try again later or contact an admin.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }

  if (imageMeta == null || image == null) {
    res.status(404).json({
      status: 'error',
      message: 'Card logo not found.',
      code: ErrorCode.CardLogoNotFound,
    })
    return
  }

  if (imageMeta.type === ImageType.enum.svg) {
    res.setHeader('Content-Type','image/svg+xml')
    res.end(image)
  } else if (imageMeta.type === ImageType.enum.png) {
    res.setHeader('Content-Type','image/png')
    res.end(Buffer.from(image, 'base64'))
  }
})

export default router
