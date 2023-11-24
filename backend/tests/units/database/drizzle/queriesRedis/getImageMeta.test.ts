import '../../../mocks/process.env'
import { addData } from '../mocks/queries'

import { createUser, createImageMeta, createUserCanUseImage } from '../../../../drizzleData'

import { getImageMeta } from '@backend/database/drizzle/queriesRedis'

describe('getImageMeta', () => {
  it('should return null if the image does not exist', async () => {
    const imageMeta = await getImageMeta('some image id that doesnt exist')
    expect(imageMeta).toBeNull()
  })

  it('should return an ImageMeta object containing the first user', async () => {
    const user = createUser()
    const imageMeta = createImageMeta('png')
    const userCanUseImage = createUserCanUseImage(user, imageMeta, true)

    addData({
      images: [imageMeta],
      users: [user],
      usersCanUseImages: [userCanUseImage],
    })

    const imageResult = await getImageMeta(imageMeta.id)
    expect(imageResult).toEqual(expect.objectContaining({
      id: imageMeta.id,
      name: imageMeta.name,
      type: imageMeta.type,
      userId: user.id,
    }))
  })

  it('should throw error, because in redis an image has user, but not in drizzle', async () => {
    const imageMeta = createImageMeta('svg')

    addData({
      images: [imageMeta],
    })

    await expect(async () => await getImageMeta(imageMeta.id)).rejects.toThrow(Error)
  })
})
