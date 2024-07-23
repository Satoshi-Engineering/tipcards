import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createUser, createImage, createUserCanUseImage } from '../../../drizzleData.js'

import { getImageMeta } from '@backend/database/deprecated/queries.js'

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

  it('should return an ImageMeta that has no userId', async () => {
    const image = createImage('svg')

    addData({
      images: [image],
    })

    const imageResult = await getImageMeta(image.id)
    expect(imageResult).toEqual(expect.objectContaining({
      id: image.id,
      name: image.name,
      type: image.type,
      userId: null,
    }))
  })
})
