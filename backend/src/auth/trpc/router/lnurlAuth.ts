import { tracked, type TrackedEnvelope } from '@trpc/server'
import { z } from 'zod'

import {
  LnurlAuthLoginStatusEnum,
  LnurlAuthLoginDto,
} from '@shared/auth/data/trpc/LnurlAuthLoginDto.js'

import { router } from '@auth/trpc/trpc.js'
import publicProcedure from '@auth/trpc/procedures/public.js'
import Auth from '@auth/domain/Auth.js'

export const lnurlAuthRouter = router({
  /**
   * This procedure is for cypress tests only as cypress is not able to handle trpc subscriptions out-of-the-box.
   *
   * @testing
   */
  create: publicProcedure
    .output(LnurlAuthLoginDto)
    .query(async () => {
      const { lnurlAuth, hash } = await Auth.instance.lnurlAuthLogin.create()
      return {
        lnurlAuth,
        hash,
        status: LnurlAuthLoginStatusEnum.enum.lnurlCreated,
      }
    }),

  login: publicProcedure
    .input(
      z
        .object({
          // lastEventId is the last event id that the client has received
          // On the first call, it will be whatever was passed in the initial setup
          // If the client reconnects, it will be the last event id that the client received
          lastEventId: z.string().nullish(),
        })
        .optional(),
    )
    // todo: add output type definition/validation:
    // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/1300#note_19422
    //.output(LnurlAuthLoginDto)
    .subscription(async function* ({ input }): AsyncGenerator<TrackedEnvelope<LnurlAuthLoginDto>> {
      const { id, lnurlAuth, hash } = await Auth.instance.lnurlAuthLogin.getOrCreate(input?.lastEventId)

      if (Auth.instance.lnurlAuthLogin.isOneTimeLoginHashValid(hash)) {
        yield loginResponse(id, {
          lnurlAuth,
          hash,
          status: LnurlAuthLoginStatusEnum.enum.loggedIn,
        })
        return
      }

      yield loginResponse(id, {
        lnurlAuth,
        status: LnurlAuthLoginStatusEnum.enum.lnurlCreated,
      })

      try {
        await Auth.instance.lnurlAuthLogin.waitForLogin(hash)
        yield loginResponse(id, {
          lnurlAuth,
          hash,
          status: LnurlAuthLoginStatusEnum.enum.loggedIn,
        })
      } catch {
        yield loginResponse(id, {
          lnurlAuth,
          status: LnurlAuthLoginStatusEnum.enum.failed,
        })
      }
    }),
})

// workaround until procedure.output(LnurlAuthLoginDto) is implemented
const loginResponse = (lnurlAuthId: string, data: LnurlAuthLoginDto) => tracked(lnurlAuthId, LnurlAuthLoginDto.parse(data))
