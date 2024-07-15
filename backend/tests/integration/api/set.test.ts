import { describe, it, expect } from 'vitest'
import axios, { AxiosError } from 'axios'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { ErrorCode } from '@shared/data/Errors.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import { setData } from '../lib/apiData.js'
import '../lib/initAxios.js'
import FailEarly from '../../FailEarly.js'

const failEarly = new FailEarly(it)
const frontend = new FrontendSimulator()

const randomNotExistingSetId = setData.generateSetId()
const set1 = setData.generateSet()
set1.userId = expect.any(String)
const set2 = setData.generateSet()
set2.userId = expect.any(String)

type ErrorResponse  = {
  status: string,
  message: string,
  code: ErrorCode,
}

describe('load all sets', () => {
  it('should fail with 401, if the user is not logged in', async () => {
    let caughtError: AxiosError | undefined

    try {
      await frontend.loadSets()
    } catch (error) {
      caughtError = error as AxiosError
    }

    expect(caughtError).not.toBeNull()
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(401)
  })
})

describe('load single set', () => {
  it('should fail, if the set doesnt exist', async () => {
    let caughtError: AxiosError | undefined

    try {
      await frontend.loadSet(randomNotExistingSetId)
    } catch (error) {
      caughtError = error as AxiosError
    }

    expect(axios.isAxiosError(caughtError)).toBe(true)

    const responseErrorData = caughtError?.response?.data as ErrorResponse
    expect(responseErrorData.status).toBe('error')
    expect(responseErrorData.code).toBe(ErrorCode.SetNotFound)
    expect(caughtError?.response?.status).toBe(404)
  })
})

describe('save and load set', () => {
  failEarly.it('has to login', async () => {
    await frontend.login()
  })

  failEarly.it('should save a new set', async () => {
    const response = await frontend.saveSet(set1)

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: set1,
    }))
  })

  failEarly.it('should load the set', async () => {
    const response = await frontend.loadSet(set1.id)

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: set1,
    }))
  })

  failEarly.it('should update settings from the set', async () => {
    set1.settings.numberOfCards = 20
    set1.settings.cardHeadline += ' changed'
    set1.settings.cardCopytext += ' changed'
    set1.settings.setName += ' changed'

    const response = await frontend.saveSet(set1)

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: set1,
    }))
  })

  failEarly.it('should load the set and verify the changes', async () => {
    const response = await frontend.loadSet(set1.id)

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: set1,
    }))
  })

  failEarly.it('should save a second set', async () => {
    const response = await frontend.saveSet(set2)

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: set2,
    }))
  })

  failEarly.it('should load all sets', async () => {
    const response = await frontend.loadSets()

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: expect.arrayContaining([ set1, set2 ]),
    }))
  })
})
