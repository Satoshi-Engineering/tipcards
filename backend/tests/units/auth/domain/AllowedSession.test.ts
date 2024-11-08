import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'
import '../../mocks/axios.js'
import '../../mocks/drizzle.js'
import '../../mocks/process.env.js'

import { describe, it, expect, beforeAll } from 'vitest'

import AllowedSession from '@auth/domain/AllowedSession.js'

import { createUser, createAllowedSession } from '../../../drizzleData.js'
import { uuidRegex } from '../../lib/validationUtils.js'

const userDatabase = createUser()
const allowedSessionDatabase = createAllowedSession(userDatabase)
const allowedOtherSessionsDatabase = Array.from({ length: 10 }, () => createAllowedSession(userDatabase))

beforeAll(() => {
  addData({
    users: [userDatabase],
    allowedSessions: [allowedSessionDatabase, ...allowedOtherSessionsDatabase],
  })
})

describe('AllowedSession', () => {
  it('should create a new AllowedSession', async () => {
    const allowedSession = AllowedSession.createNewForUserId(userDatabase.id)
    expect(allowedSession).toEqual(expect.objectContaining({
      sessionId: expect.stringMatching(uuidRegex),
      user: userDatabase.id,
    }))
  })

  it('should get null from fromSessionId that does not exist', async () => {
    const allowedSession = await AllowedSession.fromSessionId('nonexistent')
    expect(allowedSession).toBeNull()
  })

  it('should get AllowedSession from sessionId', async () => {
    const allowedSession = await AllowedSession.fromSessionId(allowedSessionDatabase.sessionId)
    expect(allowedSession).toEqual(expect.objectContaining({
      sessionId: allowedSessionDatabase.sessionId,
      user: userDatabase.id,
    }))
  })

  it('should remove all AllowedSession of a user except a single AllowedSession', async () => {
    const allowedSession = await AllowedSession.fromSessionId(allowedSessionDatabase.sessionId)
    expect(allowedSession).toEqual(expect.objectContaining({
      sessionId: allowedSessionDatabase.sessionId,
      user: userDatabase.id,
    }))

    for (const allowedSessionOtherDatabase of allowedOtherSessionsDatabase) {
      const allowedSessionOther = await AllowedSession.fromSessionId(allowedSessionOtherDatabase.sessionId)
      expect(allowedSessionOther).toEqual(expect.objectContaining({
        sessionId: allowedSessionOtherDatabase.sessionId,
        user: userDatabase.id,
      }))
    }

    await AllowedSession.deleteAllSessionsForUserExecptOne(userDatabase.id, allowedSessionDatabase.sessionId)

    const allowedSessionStillValid = await AllowedSession.fromSessionId(allowedSessionDatabase.sessionId)
    expect(allowedSessionStillValid).toEqual(expect.objectContaining({
      sessionId: allowedSessionDatabase.sessionId,
      user: userDatabase.id,
    }))

    for (const allowedSessionOtherDatabase of allowedOtherSessionsDatabase) {
      const allowedSessionOther = await AllowedSession.fromSessionId(allowedSessionOtherDatabase.sessionId)
      expect(allowedSessionOther).toBeNull()
    }
  })

  it('should insert new AllowedSession', async () => {
    const allowedSession = AllowedSession.createNewForUserId(userDatabase.id)

    const allowedSessionBeforeUpdate = await AllowedSession.fromSessionId(allowedSession.sessionId)
    expect(allowedSessionBeforeUpdate).toBeNull()

    await allowedSession.insert()

    const allowedSessionAfterUpdate = await AllowedSession.fromSessionId(allowedSession.sessionId)
    expect(allowedSessionAfterUpdate).toEqual(expect.objectContaining({
      sessionId: allowedSession.sessionId,
      user: userDatabase.id,
    }))
  })

  it('should delete AllowedSession', async () => {
    const allowedSession = AllowedSession.createNewForUserId(userDatabase.id)
    await allowedSession.insert()
    const allowedSessionBeforeDelete = await AllowedSession.fromSessionId(allowedSession.sessionId)
    expect(allowedSessionBeforeDelete).toEqual(expect.objectContaining({
      sessionId: allowedSession.sessionId,
      user: userDatabase.id,
    }))

    await allowedSession.delete()

    const allowedSessionAfterDelete = await AllowedSession.fromSessionId(allowedSession.sessionId)
    expect(allowedSessionAfterDelete).toBeNull()
  })
})
