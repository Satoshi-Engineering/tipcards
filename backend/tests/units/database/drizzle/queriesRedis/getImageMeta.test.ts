import '../../../mocks/process.env'
import '../mocks/client'
import { addData } from '../mocks/database'

import { createUser, createImage, createUserCanUseImage } from '../../../../drizzleData'

import { getImageMeta } from '@backend/database/drizzle/queriesRedis'

describe('getImageMeta', () => {
  it('should return null if the image does not exist', async () => {
    const imageMeta = await getImageMeta('some image id that doesnt exist')
    expect(imageMeta).toBeNull()
  })

  it('should return an ImageMeta object containing the first user', async () => {
    const user = createUser()
    const image = createImage('png')
    const userCanUseImage = createUserCanUseImage(user, image, true)

    addData({
      images: [image],
      users: [user],
      usersCanUseImages: [userCanUseImage],
    })

    const imageResult = await getImageMeta(image.id)
    expect(imageResult).toEqual(expect.objectContaining({
      id: image.id,
      name: image.name,
      type: image.type,
      userId: user.id,
    }))
  })

  it('should throw an error, because in redis an image must have a user', async () => {
    const image = createImage('svg')

    addData({
      images: [image],
    })

    await expect(async () => await getImageMeta(image.id)).rejects.toThrow(Error)
  })
})
