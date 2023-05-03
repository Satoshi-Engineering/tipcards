import { randomUUID } from 'crypto'

export const createImageId = () => randomUUID().replace(/-/g, '') // redis search cannot process hyphens (-) in indices

export enum ImageType {
  Svg = 'svg',
  Png = 'png',
}

export type ImageMeta = {
  id: string // uuid but without hyphens (see above)
  type: ImageType
  name: string
  userId: string // owner/creator of the image
}
